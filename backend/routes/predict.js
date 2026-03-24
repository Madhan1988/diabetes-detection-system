const express = require("express");
const axios = require("axios");
const Prediction = require("../models/Prediction");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

router.post("/", protect, async (req, res) => {
  const inputPayload = {
    Pregnancies: +(req.body.Pregnancies || 0),
    Glucose: +(req.body.Glucose || 0),
    BloodPressure: +(req.body.BloodPressure || 0),
    SkinThickness: +(req.body.SkinThickness || 0),
    Insulin: +(req.body.Insulin || 0),
    BMI: +(req.body.BMI || 0),
    DiabetesPedigreeFunction: +(req.body.DiabetesPedigreeFunction || 0),
    Age: +(req.body.Age || 0),
  };

  try {
    const { data } = await axios.post(`${ML_URL}/predict`, inputPayload, { timeout: 10000 });
    
    // Save to MongoDB
    const prediction = await Prediction.create({
      user: req.user._id,
      input: inputPayload,
      result: data,
      notes: req.body.notes || ""
    });

    // Update user prediction count
    await User.findByIdAndUpdate(req.user._id, { $inc: { predictionCount: 1 } });

    res.status(201).json({ 
      prediction, 
      mlResult: data 
    });
  } catch (err) {
    console.error("ML service error:", err.message);
    res.status(502).json({ error: "ML service unavailable." });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Prediction.countDocuments({ user: req.user._id });
    const data = await Prediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", protect, async (req, res) => {
  try {
    const stats = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          diabeticCount: { $sum: { $cond: [{ $eq: ["$result.prediction", 1] }, 1, 0] } },
          avgProbability: { $avg: "$result.probability" }
        }
      }
    ]);

    res.json(stats[0] || { total: 0, diabeticCount: 0, avgProbability: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const prediction = await Prediction.findOne({ _id: req.params.id, user: req.user._id });
    if (!prediction) return res.status(404).json({ error: "Not found" });
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const prediction = await Prediction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!prediction) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
