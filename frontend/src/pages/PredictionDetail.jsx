import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { predictAPI } from "../services/api";
import toast from "react-hot-toast";
import ResultCard from "../components/ResultCard";

const fieldLabels = {
  Pregnancies:              { label: "Pregnancies",              unit: "",        icon: "🤰" },
  Glucose:                  { label: "Glucose",                  unit: "mg/dL",   icon: "🍬" },
  BloodPressure:            { label: "Blood Pressure",           unit: "mmHg",    icon: "❤️" },
  SkinThickness:            { label: "Skin Thickness",           unit: "mm",      icon: "📏" },
  Insulin:                  { label: "Insulin",                  unit: "µU/mL",   icon: "💉" },
  BMI:                      { label: "BMI",                      unit: "kg/m²",   icon: "⚖️" },
  DiabetesPedigreeFunction: { label: "Diabetes Pedigree Fn.",    unit: "",        icon: "🧬" },
  Age:                      { label: "Age",                      unit: "yrs",     icon: "🎂" },
};

export default function PredictionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pred,    setPred]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictAPI.getOne(id)
      .then(({ data }) => setPred(data))
      .catch(() => { toast.error("Not found"); navigate("/history"); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );
  if (!pred) return null;

  return (
    <div className="space-y-7 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Link to="/history" className="text-slate-500 hover:text-slate-300 text-sm">← History</Link>
        <span className="text-dark-border">/</span>
        <span className="text-slate-400 text-sm">Prediction Detail</span>
      </div>

      <div>
        <h1 className="text-2xl font-display font-bold text-white">Prediction Report</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date(pred.createdAt).toLocaleString("en-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
          })}
        </p>
      </div>

      {/* Reuse ResultCard — fake the response shape */}
      <ResultCard result={{ mlResult: pred.result, prediction: pred }} />

      {/* Input metrics table */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-white mb-5">Input Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(pred.input).map(([key, val]) => {
            const meta = fieldLabels[key] || { label: key, unit: "", icon: "📊" };
            return (
              <div key={key} className="bg-dark rounded-xl p-4 border border-dark-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{meta.icon}</span>
                  <span className="text-xs text-slate-500">{meta.label}</span>
                </div>
                <p className="font-mono font-semibold text-white">
                  {val} <span className="text-xs text-slate-500 font-normal">{meta.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {pred.notes && (
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-slate-300 text-sm">{pred.notes}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link to="/predict" className="btn-primary">🧬 Run Another Test</Link>
        <Link to="/history" className="btn-outline">← Back to History</Link>
      </div>
    </div>
  );
}
