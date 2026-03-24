require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes    = require("./routes/auth");
const predictRoutes = require("./routes/predict");
const userRoutes    = require("./routes/users");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// Rate limiter – 100 req / 15 min per IP
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/users",   userRoutes);

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", service: "Diabetes Detection API", time: new Date() })
);

// 404 fallback
app.use((_, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, _, res, __) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "diabetesdb" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

