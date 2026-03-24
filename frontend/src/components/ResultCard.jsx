import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const riskStyle = {
  Low:        { bg: "bg-success/10", border: "border-success/30", text: "text-success",    emoji: "✅" },
  Moderate:   { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning",    emoji: "⚠️" },
  High:       { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", emoji: "🔶" },
  "Very High":{ bg: "bg-danger/10",  border: "border-danger/30",  text: "text-danger",     emoji: "🚨" },
};

export default function ResultCard({ result }) {
  const { mlResult, prediction } = result;
  const r  = mlResult || prediction?.result;
  if (!r) return null;

  const style = riskStyle[r.risk_level] || riskStyle["Low"];

  // Feature contributions chart
  const contribs = r.feature_contributions || {};
  const labels   = Object.keys(contribs);
  const values   = Object.values(contribs);

  const barData = {
    labels,
    datasets: [{
      label: "Importance %",
      data: values,
      backgroundColor: labels.map((_, i) =>
        i === 0 ? "#0ea5e9" :
        i === 1 ? "#6366f1" :
        i === 2 ? "#8b5cf6" :
        i === 3 ? "#ec4899" : "#64748b"
      ),
      borderRadius: 4,
    }],
  };

  return (
    <div className={`card border ${style.border} ${style.bg} p-7 animate-fadeIn`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{style.emoji}</span>
            <h2 className="text-xl font-display font-bold text-white">
              {r.diabetic ? "Diabetes Risk Detected" : "Low Diabetes Risk"}
            </h2>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            {r.diabetic
              ? "The model indicates elevated diabetes risk. Please consult a healthcare provider."
              : "Your current metrics suggest low diabetes risk. Keep up the healthy habits!"}
          </p>
        </div>
        <div className="text-right shrink-0 ml-6">
          <p className={`text-4xl font-display font-bold ${style.text}`}>
            {r.probability}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Risk probability</p>
          <span className={`badge mt-2 ${style.text} border ${style.border}`}>
            {r.risk_level} Risk
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2.5 rounded-full bg-dark-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${r.probability}%`,
              background: r.probability > 75 ? "#ef4444"
                        : r.probability > 55 ? "#f97316"
                        : r.probability > 30 ? "#f59e0b"
                        : "#22c55e",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {(r.recommendations || []).map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-primary shrink-0 mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature chart */}
        {labels.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Feature Importance
            </h3>
            <Bar
              data={barData}
              options={{
                indexAxis: "y",
                responsive: true,
                scales: {
                  x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b", font: { size: 10 } } },
                  y: { grid: { display: false },   ticks: { color: "#94a3b8", font: { size: 10 } } },
                },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw.toFixed(1)}%` } } },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
