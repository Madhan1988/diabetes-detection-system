import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Layout       from "./components/Layout";
import Landing      from "./pages/Landing";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import Predict      from "./pages/Predict";
import History      from "./pages/History";
import PredictionDetail from "./pages/PredictionDetail";
import Profile      from "./pages/Profile";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0f172a" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#0f172a" } },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/predict"          element={<Predict />} />
            <Route path="/history"          element={<History />} />
            <Route path="/history/:id"      element={<PredictionDetail />} />
            <Route path="/profile"          element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
