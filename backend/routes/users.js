const express = require("express");
const User    = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/users  (admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/:id
router.get("/:id", protect, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// PATCH /api/users/:id/deactivate (admin)
router.patch("/:id/deactivate", protect, authorize("admin"), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  res.json(user);
});

module.exports = router;
