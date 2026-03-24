import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="text-center mb-8">
          <span className="text-4xl">🩺</span>
          <h1 className="text-2xl font-display font-bold text-white mt-3">Sign in</h1>
          <p className="text-slate-500 text-sm mt-1">Continue to DiabetesDetect</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in…</> : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">Create one</Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-slate-600 hover:text-slate-400">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
