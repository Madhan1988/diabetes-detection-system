import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { predictAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const riskClass = (level) => ({
  Low:       "risk-low",
  Moderate:  "risk-moderate",
  High:      "risk-high",
  "Very High": "risk-veryhigh",
}[level] || "risk-low");

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([predictAPI.stats(), predictAPI.history(1)])
      .then(([s, h]) => { setStats(s.data); setHistory(h.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recentFive = history.slice(0, 5);
  const lineData   = {
    labels: [...recentFive].reverse().map((p, i) => `Test ${i + 1}`),
    datasets: [{
      label: "Risk %",
      data: [...recentFive].reverse().map((p) => p.result.probability),
      borderColor: "#0ea5e9",
      backgroundColor: "rgba(14,165,233,0.08)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#0ea5e9",
      pointRadius: 5,
    }],
  };

  const doughnutData = {
    labels: ["Diabetic", "Non-Diabetic"],
    datasets: [{
      data: [stats?.diabeticCount || 0, (stats?.total || 0) - (stats?.diabeticCount || 0)],
      backgroundColor: ["#ef4444", "#22c55e"],
      borderColor:     ["#ef4444", "#22c55e"],
      borderWidth: 1,
    }],
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your health overview</p>
        </div>
        <Link to="/predict" className="btn-primary flex items-center gap-2">
          🧬 New Test
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Tests",    value: stats?.total         ?? 0,    icon: "📋", color: "text-primary" },
          { label: "Avg. Risk %",    value: `${Math.round(stats?.avgProbability ?? 0)}%`, icon: "📈", color: "text-warning" },
          { label: "Diabetic Tests", value: stats?.diabeticCount ?? 0,    icon: "⚠️", color: "text-danger" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <span className={`text-2xl font-display font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-slate-500 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {history.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card p-5 md:col-span-2">
            <h2 className="text-sm font-semibold text-slate-400 mb-4">Risk Trend</h2>
            <Line
              data={lineData}
              options={{
                responsive: true,
                scales: {
                  y: { min: 0, max: 100, grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
                  x: { grid: { display: false }, ticks: { color: "#64748b" } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-400 mb-4">Outcome Split</h2>
            <Doughnut
              data={doughnutData}
              options={{
                cutout: "65%",
                plugins: {
                  legend: { position: "bottom", labels: { color: "#94a3b8", boxWidth: 12 } },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <h2 className="font-display font-semibold text-white">Recent Tests</h2>
          <Link to="/history" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        {recentFive.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <p className="text-4xl mb-3">🩺</p>
            <p>No tests yet.</p>
            <Link to="/predict" className="text-primary hover:underline text-sm">Run your first test →</Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {recentFive.map((p) => (
              <Link
                key={p._id}
                to={`/history/${p._id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-dark/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Glucose {p.input.Glucose} · BMI {p.input.BMI} · Age {p.input.Age}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-slate-300">{p.result.probability}%</span>
                  <span className={`badge ${riskClass(p.result.risk_level)}`}>{p.result.risk_level}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
