import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name:   user?.name   || "",
    age:    user?.profile?.age    || "",
    gender: user?.profile?.gender || "",
    phone:  user?.profile?.phone  || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateMe({
        name:    form.name,
        profile: { age: +form.age || undefined, gender: form.gender, phone: form.phone },
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7 animate-fadeIn max-w-xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-3xl font-bold text-primary">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display font-bold text-white text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="badge bg-primary/10 text-primary border border-primary/20 text-xs mt-2">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card p-7 space-y-5">
        <h2 className="font-display font-semibold text-white">Edit Details</h2>

        <div>
          <label className="label">Full Name</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Age</label>
            <input className="input" name="age" type="number" min={1} max={120} value={form.age} onChange={handleChange} placeholder="Age" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Phone</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary flex items-center gap-2 px-7" disabled={saving}>
            {saving ? <><div className="spinner" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Account info */}
      <div className="card p-6 space-y-3">
        <h2 className="font-display font-semibold text-white mb-4">Account</h2>
        {[
          { label: "Email",       value: user?.email },
          { label: "Role",        value: user?.role },
          { label: "Tests Run",   value: user?.predictionCount ?? 0 },
          { label: "Member Since",value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year:"numeric", month:"long" }) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2 border-b border-dark-border/50 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm text-slate-200 font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
