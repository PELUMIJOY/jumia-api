const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true }, // Could be email or phone number
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false }, // Track if OTP has been used
    createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires in 5 minutes
  },
  { timestamps: true }
);

module.exports = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
