// const mongoose = require("mongoose");

// const OtpSchema = new mongoose.Schema({
//   identifier: { type: String, required: true },
//   otp: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires in 5 minutes
// });

// // Check if the model already exists before defining it
// const Otp = mongoose.models.otp || mongoose.model("otp", OtpSchema);

// module.exports = Otp;

const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires in 5 minutes
});

module.exports = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
