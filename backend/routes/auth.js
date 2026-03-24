const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", protect, async (req, res) => {
  try {
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
