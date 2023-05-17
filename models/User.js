// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String },
  otpExpiration: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  blockedUntil: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
