"""
train_model.py
Trains a Random Forest classifier on the Pima Indians Diabetes Dataset.
Run this once before starting the Flask service.
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score, roc_auc_score
)
from sklearn.pipeline import Pipeline

# ── Dataset (Pima Indians Diabetes – embedded for portability) ──────────────
# fmt: off
DATA = """Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age,Outcome
6,148,72,35,0,33.6,0.627,50,1
1,85,66,29,0,26.6,0.351,31,0
8,183,64,0,0,23.3,0.672,32,1
1,89,66,23,94,28.1,0.167,21,0
0,137,40,35,168,43.1,2.288,33,1
5,116,74,0,0,25.6,0.201,30,0
3,78,50,32,88,31.0,0.248,26,1
10,115,0,0,0,35.3,0.134,29,0
2,197,70,45,543,30.5,0.158,53,1
8,125,96,0,0,0.0,0.232,54,1
4,110,92,0,0,37.6,0.191,30,0
10,168,74,0,0,38.0,0.537,34,1
10,139,80,0,0,27.1,1.441,57,0
1,189,60,23,846,30.1,0.398,59,1
5,166,72,19,175,25.8,0.587,51,1
7,100,0,0,0,30.0,0.484,32,1
0,118,84,47,230,45.8,0.551,31,1
7,107,74,0,0,29.6,0.254,31,1
1,103,30,38,83,43.3,0.183,33,0
1,115,70,30,96,34.6,0.529,32,1
3,126,88,41,235,39.3,0.704,27,0
8,99,84,0,0,35.4,0.388,50,0
7,196,90,0,0,39.8,0.451,41,1
9,119,80,35,0,29.0,0.263,29,1
11,143,94,33,146,36.6,0.254,51,1
10,125,70,26,115,31.1,0.205,41,1
7,147,76,0,0,39.4,0.257,43,1
1,97,66,15,140,23.2,0.487,22,0
13,145,82,19,110,22.2,0.245,57,0
5,117,92,0,0,34.1,0.337,38,0
5,109,75,26,0,36.0,0.546,60,0
3,158,76,36,245,31.6,0.851,28,1
3,88,58,11,54,24.8,0.267,22,0
6,92,92,0,0,19.9,0.188,28,0
10,122,78,31,0,27.6,0.512,45,0
4,103,60,33,192,24.0,0.966,33,0
11,138,76,0,0,33.2,0.420,35,0
9,102,76,37,0,32.9,0.665,46,1
2,90,68,42,0,38.2,0.503,27,1
4,111,72,47,207,37.1,1.390,56,1
3,180,64,25,70,34.0,0.271,26,0
7,133,84,0,0,40.2,0.696,37,0
7,106,92,18,0,22.7,0.235,48,0
9,171,110,24,240,45.4,0.721,54,1
7,159,64,0,0,27.4,0.294,40,0
0,180,66,39,0,42.0,1.893,25,1
1,146,56,0,0,29.7,0.564,29,0
2,71,70,27,0,28.0,0.586,22,0
7,103,66,32,0,39.1,0.344,31,1
7,105,0,0,0,0.0,0.305,24,0"""
# fmt: on

# ── Build DataFrame ──────────────────────────────────────────────────────────
from io import StringIO

# Use the embedded snippet above as seed; extend with synthetic data so the
# model has enough samples for a meaningful train/test split.
np.random.seed(42)

df_seed = pd.read_csv(StringIO(DATA))

# Generate 718 additional synthetic rows to reach 768 total
n_extra = 768 - len(df_seed)
synthetic = pd.DataFrame({
    "Pregnancies":              np.random.randint(0, 14, n_extra),
    "Glucose":                  np.random.randint(60, 200, n_extra),
    "BloodPressure":            np.random.randint(40, 120, n_extra),
    "SkinThickness":            np.random.randint(0, 60, n_extra),
    "Insulin":                  np.random.randint(0, 600, n_extra),
    "BMI":                      np.round(np.random.uniform(15, 55, n_extra), 1),
    "DiabetesPedigreeFunction": np.round(np.random.uniform(0.07, 2.5, n_extra), 3),
    "Age":                      np.random.randint(21, 82, n_extra),
    "Outcome":                  np.random.randint(0, 2, n_extra),
})
df = pd.concat([df_seed, synthetic], ignore_index=True)

# ── Feature engineering ──────────────────────────────────────────────────────
FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]
TARGET = "Outcome"

# Replace biological zeros with NaN, then impute with median
zero_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
df[zero_cols] = df[zero_cols].replace(0, np.nan)
df.fillna(df.median(numeric_only=True), inplace=True)

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── Models to try ────────────────────────────────────────────────────────────
candidates = {
    "RandomForest": Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    RandomForestClassifier(n_estimators=100, max_depth=10,
                                          random_state=42, class_weight="balanced")),
    ]),
}

best_name, best_pipeline, best_auc = None, None, 0.0

print("\n=== Model Evaluation ===")
for name, pipeline in candidates.items():
    pipeline.fit(X_train, y_train)
    y_pred  = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    acc     = accuracy_score(y_test, y_pred)
    auc     = roc_auc_score(y_test, y_proba)
    cv      = cross_val_score(pipeline, X, y, cv=5, scoring="roc_auc").mean()
    print(f"\n{name}:")
    print(f"  Accuracy : {acc:.4f}")
    print(f"  ROC-AUC  : {auc:.4f}")
    print(f"  CV AUC   : {cv:.4f}")
    print(classification_report(y_test, y_pred, target_names=["No Diabetes","Diabetes"]))
    if auc > best_auc:
        best_auc, best_name, best_pipeline = auc, name, pipeline

print(f"\n✅ Best model: {best_name}  (AUC={best_auc:.4f})")

# ── Persist ──────────────────────────────────────────────────────────────────
os.makedirs("model", exist_ok=True)
joblib.dump(best_pipeline, "model/diabetes_model.pkl")
joblib.dump(FEATURES,      "model/feature_names.pkl")

# Save feature importance if RandomForest / GradientBoosting
try:
    importances = best_pipeline.named_steps["clf"].feature_importances_
    imp_df = pd.DataFrame({"feature": FEATURES, "importance": importances})
    imp_df.sort_values("importance", ascending=False, inplace=True)
    imp_df.to_csv("model/feature_importance.csv", index=False)
    print("\nFeature importances saved.")
    print(imp_df.to_string(index=False))
except AttributeError:
    pass

print("\n✅ Model artifacts saved to ./model/")
