import { Link } from "react-router-dom";

const features = [
  { icon: "🧬", title: "ML-Powered Analysis", desc: "Random Forest classifier trained on clinical diabetes data with 80%+ accuracy." },
  { icon: "⚡", title: "Instant Results",      desc: "Get your risk assessment and personalised recommendations in seconds." },
  { icon: "📊", title: "Detailed Insights",    desc: "View probability scores, feature contributions, and trend history." },
  { icon: "🔒", title: "Secure & Private",     desc: "JWT authentication, bcrypt hashing, rate limiting, and HTTPS." },
];

const metrics = [
  { value: "80%+", label: "Model Accuracy" },
  { value: "8",    label: "Health Metrics" },
  { value: "<1s",  label: "Inference Time" },
  { value: "100%", label: "Private Data" },
];

export default function Landing() {
  return (
    <div className="min-h-screen font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-dark-border/50">
        <div className="flex items-center gap-2 text-lg font-display font-bold text-white">
          <span>🩺</span> DiabetesDetect
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"    className="btn-outline text-sm py-2 px-4">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-24 pb-16 animate-fadeIn">
        <span className="badge bg-primary/10 text-primary border border-primary/20 text-xs mb-6">
          🧠 Powered by Machine Learning
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
          Diabetes Detection<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
            System
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Enter your health metrics and get an AI-powered diabetes risk assessment
          with personalised clinical recommendations — instantly.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base py-3 px-8">
            Start Free Assessment →
          </Link>
          <Link to="/login" className="btn-outline text-base py-3 px-8">
            Sign In
          </Link>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <div className="card p-6 grid grid-cols-4 gap-4 text-center">
          {metrics.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-display font-bold text-primary">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-display font-bold text-white text-center mb-10">
          Everything you need for diabetes risk screening
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card p-6 hover:border-primary/30 transition-colors">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border/50 text-center py-6 text-slate-600 text-sm">
        DiabetesDetect — MERN + ML Stack · Built with React, Express, MongoDB & scikit-learn
      </footer>
    </div>
  );
}
