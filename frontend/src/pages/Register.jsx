import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="text-center mb-8">
          <span className="text-4xl">🩺</span>
          <h1 className="text-2xl font-display font-bold text-white mt-3">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Start your health journey</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          {[
            { label: "Full Name",        name: "name",     type: "text",     placeholder: "John Doe" },
            { label: "Email",            name: "email",    type: "email",    placeholder: "you@example.com" },
            { label: "Password",         name: "password", type: "password", placeholder: "Min. 6 characters" },
            { label: "Confirm Password", name: "confirm",  type: "password", placeholder: "Repeat password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <button className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
            {loading ? <><div className="spinner" /> Creating…</> : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
