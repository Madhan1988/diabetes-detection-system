const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 60 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role:     { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    profile: {
      age:    { type: Number, min: 1, max: 120 },
      gender: { type: String, enum: ["male", "female", "other"] },
      phone:  { type: String },
    },
    isActive:      { type: Boolean, default: true },
    lastLogin:     { type: Date },
    predictionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Strip sensitive data
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
