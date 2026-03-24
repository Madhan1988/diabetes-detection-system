const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Input health metrics
    input: {
      Pregnancies:              { type: Number, required: true },
      Glucose:                  { type: Number, required: true },
      BloodPressure:            { type: Number, required: true },
      SkinThickness:            { type: Number, required: true },
      Insulin:                  { type: Number, required: true },
      BMI:                      { type: Number, required: true },
      DiabetesPedigreeFunction: { type: Number, required: true },
      Age:                      { type: Number, required: true },
    },

    // ML result
    result: {
      prediction:    { type: Number, required: true },   // 0 or 1
      probability:   { type: Number, required: true },   // 0–100
      risk_level:    { type: String, required: true },
      risk_color:    { type: String },
      diabetic:      { type: Boolean, required: true },
      recommendations: [{ type: String }],
      feature_contributions: { type: mongoose.Schema.Types.Mixed },
    },

    notes:    { type: String, maxlength: 500 },
    reviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PredictionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Prediction", PredictionSchema);
