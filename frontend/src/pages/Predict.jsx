import { useState } from "react";
import { predictAPI } from "../services/api";
import toast from "react-hot-toast";
import ResultCard from "../components/ResultCard";

const FIELDS = [
  {
    name: "Pregnancies",
    label: "Pregnancies",
    min: 0, max: 20, step: 1,
    placeholder: "0–17",
    hint: "Number of times pregnant",
    icon: "🤰",
  },
  {
    name: "Glucose",
    label: "Glucose (mg/dL)",
    min: 50, max: 300, step: 1,
    placeholder: "70–200",
    hint: "Plasma glucose concentration (2hr oral glucose tolerance)",
    icon: "🍬",
  },
  {
    name: "BloodPressure",
    label: "Blood Pressure (mmHg)",
    min: 0, max: 140, step: 1,
    placeholder: "60–120",
    hint: "Diastolic blood pressure",
    icon: "❤️",
  },
  {
    name: "SkinThickness",
    label: "Skin Thickness (mm)",
    min: 0, max: 100, step: 1,
    placeholder: "0–60",
    hint: "Triceps skin fold thickness",
    icon: "📏",
  },
  {
    name: "Insulin",
    label: "Insulin (µU/mL)",
    min: 0, max: 900, step: 1,
    placeholder: "0–300",
    hint: "2-hour serum insulin",
    icon: "💉",
  },
  {
    name: "BMI",
    label: "BMI (kg/m²)",
    min: 10, max: 70, step: 0.1,
    placeholder: "18–45",
    hint: "Body mass index",
    icon: "⚖️",
  },
  {
    name: "DiabetesPedigreeFunction",
    label: "Diabetes Pedigree Function",
    min: 0.05, max: 2.5, step: 0.001,
    placeholder: "0.07–2.42",
    hint: "Genetic influence score based on family history",
    icon: "🧬",
  },
  {
    name: "Age",
    label: "Age (years)",
    min: 1, max: 120, step: 1,
    placeholder: "21–81",
    hint: "Age in years",
    icon: "🎂",
  },
];

const DEFAULTS = {
  Pregnancies: "", Glucose: "", BloodPressure: "", SkinThickness: "",
  Insulin: "", BMI: "", DiabetesPedigreeFunction: "", Age: "",
};

const SAMPLE = {
  Pregnancies: 6, Glucose: 148, BloodPressure: 72, SkinThickness: 35,
  Insulin: 0, BMI: 33.6, DiabetesPedigreeFunction: 0.627, Age: 50,
};

export default function Predict() {
  const [form,    setForm]    = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await predictAPI.submit({ ...form, notes: "" });
      setResult(data);
      toast.success("Analysis complete!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => { setForm(SAMPLE); setResult(null); };
  const clearForm  = () => { setForm(DEFAULTS); setResult(null); };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">New Diabetes Test</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your health metrics below for an instant AI-powered risk assessment.
        </p>
      </div>

      {/* Result */}
      {result && <ResultCard result={result} />}

      {/* Form */}
      <div className="card p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-white">Health Metrics</h2>
          <div className="flex gap-2">
            <button onClick={loadSample} className="btn-outline text-xs py-1.5 px-3">
              Load Sample
            </button>
            <button onClick={clearForm} className="btn-outline text-xs py-1.5 px-3">
              Clear
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-5 mb-7">
            {FIELDS.map(({ name, label, min, max, step, placeholder, hint, icon }) => (
              <div key={name}>
                <label className="label flex items-center gap-1.5">
                  <span>{icon}</span> {label}
                </label>
                <input
                  className="input"
                  type="number"
                  name={name}
                  min={min}
                  max={max}
                  step={step}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-slate-600 mt-1">{hint}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-dark-border">
            <p className="text-xs text-slate-600">
              ⚠️ This tool is for informational purposes only. Consult a doctor for medical advice.
            </p>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2 px-8 py-3"
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" /> Analysing…</>
                : "🔬 Analyse Risk →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
