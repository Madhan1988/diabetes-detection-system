"""
app.py — Flask ML microservice for Diabetes Detection
Exposes /predict and /health endpoints consumed by the Node backend.
"""

import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ── Load model ────────────────────────────────────────────────────────────────
MODEL_PATH    = os.path.join("model", "diabetes_model.pkl")
FEATURES_PATH = os.path.join("model", "feature_names.pkl")

try:
    model    = joblib.load(MODEL_PATH)
    features = joblib.load(FEATURES_PATH)
    print(f"✅ Model loaded. Features: {features}")
except FileNotFoundError:
    print("⚠️  Model not found. Run train_model.py first.")
    model, features = None, []

# ── Risk thresholds ───────────────────────────────────────────────────────────
def get_risk_level(probability: float) -> dict:
    if probability < 0.30:
        return {"level": "Low",      "color": "#22c55e", "emoji": "✅"}
    elif probability < 0.55:
        return {"level": "Moderate", "color": "#f59e0b", "emoji": "⚠️"}
    elif probability < 0.75:
        return {"level": "High",     "color": "#f97316", "emoji": "🔶"}
    else:
        return {"level": "Very High","color": "#ef4444", "emoji": "🚨"}


def get_recommendations(data: dict, probability: float) -> list[str]:
    recs = []
    if data.get("Glucose", 0) > 125:
        recs.append("Your glucose level is elevated. Consider reducing sugary foods and refined carbohydrates.")
    if data.get("BMI", 0) > 30:
        recs.append("BMI indicates obesity. A 5–10% weight loss can significantly reduce diabetes risk.")
    if data.get("BloodPressure", 0) > 80:
        recs.append("Blood pressure is high. Reduce sodium intake and consider aerobic exercise.")
    if data.get("Age", 0) > 45:
        recs.append("Age is a risk factor. Regular screening every 1–3 years is recommended.")
    if data.get("Insulin", 0) == 0:
        recs.append("Insulin data was missing. Consider fasting insulin testing for better accuracy.")
    if probability > 0.5:
        recs.append("Consult a healthcare professional for a formal diabetes evaluation.")
        recs.append("Adopt a balanced diet rich in vegetables, whole grains, and lean proteins.")
        recs.append("Aim for at least 150 minutes of moderate physical activity per week.")
    if not recs:
        recs.append("Maintain your healthy lifestyle with regular exercise and balanced nutrition.")
        recs.append("Annual health check-ups are still recommended.")
    return recs


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "model_loaded": model is not None,
        "features":     features,
    })


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Run train_model.py first."}), 503

    body = request.get_json(force=True)

    # Validate & extract features
    missing = [f for f in features if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        input_values = [[float(body[f]) for f in features]]
        X = np.array(input_values)
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400

    probability  = float(model.predict_proba(X)[0][1])
    prediction   = int(model.predict(X)[0])
    risk         = get_risk_level(probability)
    recs         = get_recommendations(body, probability)

    # Feature contributions (if RF/GB)
    contributions = {}
    try:
        clf = model.named_steps["clf"]
        imp = clf.feature_importances_
        for fname, importance in zip(features, imp):
            contributions[fname] = round(float(importance) * 100, 2)
    except AttributeError:
        pass

    return jsonify({
        "prediction":         prediction,
        "probability":        round(probability * 100, 2),
        "risk_level":         risk["level"],
        "risk_color":         risk["color"],
        "risk_emoji":         risk["emoji"],
        "diabetic":           prediction == 1,
        "recommendations":    recs,
        "feature_contributions": contributions,
        "input_summary": {f: body[f] for f in features},
    })


@app.route("/batch-predict", methods=["POST"])
def batch_predict():
    """Accept a list of patient records and return predictions for all."""
    if model is None:
        return jsonify({"error": "Model not loaded."}), 503

    records = request.get_json(force=True)
    if not isinstance(records, list):
        return jsonify({"error": "Expected a JSON array of records."}), 400

    results = []
    for i, rec in enumerate(records):
        missing = [f for f in features if f not in rec]
        if missing:
            results.append({"index": i, "error": f"Missing: {missing}"})
            continue
        X = np.array([[float(rec[f]) for f in features]])
        prob = float(model.predict_proba(X)[0][1])
        risk = get_risk_level(prob)
        results.append({
            "index":       i,
            "probability": round(prob * 100, 2),
            "risk_level":  risk["level"],
            "diabetic":    prob >= 0.5,
        })
    return jsonify(results)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false") == "true")
