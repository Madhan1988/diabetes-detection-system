import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { predictAPI } from "../services/api";
import toast from "react-hot-toast";

const riskClass = (level) => ({
  Low:        "risk-low",
  Moderate:   "risk-moderate",
  High:       "risk-high",
  "Very High":"risk-veryhigh",
}[level] || "risk-low");

export default function History() {
  const [data,    setData]    = useState([]);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const res = await predictAPI.history(p);
      setData(res.data.data);
      setPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
      setPage(p);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(1); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm("Delete this prediction?")) return;
    try {
      await predictAPI.delete(id);
      toast.success("Deleted");
      fetch(page);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Test History</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total prediction{total !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/predict" className="btn-primary">🧬 New Test</Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-4xl mb-3">📋</p>
            <p>No predictions yet.</p>
            <Link to="/predict" className="text-primary hover:underline text-sm mt-2 inline-block">
              Run your first test →
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 border-b border-dark-border text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="col-span-2">Metrics</span>
              <span>Glucose</span>
              <span>BMI</span>
              <span>Risk</span>
              <span>Date</span>
            </div>

            <div className="divide-y divide-dark-border">
              {data.map((p) => (
                <Link
                  key={p._id}
                  to={`/history/${p._id}`}
                  className="group flex md:grid md:grid-cols-6 gap-4 items-center px-6 py-4 hover:bg-dark/50 transition-colors"
                >
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.result.diabetic ? "bg-danger animate-pulseRing" : "bg-success"}`} />
                      <span className="text-sm font-medium text-slate-200">
                        {p.result.diabetic ? "High Risk" : "Low Risk"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-4">
                      {p.result.probability}% probability · Age {p.input.Age}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-slate-300">{p.input.Glucose}</span>
                  <span className="font-mono text-sm text-slate-300">{p.input.BMI}</span>
                  <span className={`badge ${riskClass(p.result.risk_level)} text-xs`}>{p.result.risk_level}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                    <button
                      onClick={(e) => handleDelete(p._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-danger text-xs transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-dark-border">
                <button
                  onClick={() => fetch(page - 1)}
                  disabled={page === 1}
                  className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40"
                >← Prev</button>
                <span className="text-xs text-slate-500">Page {page} of {pages}</span>
                <button
                  onClick={() => fetch(page + 1)}
                  disabled={page === pages}
                  className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40"
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
