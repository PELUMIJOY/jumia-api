const jwt = require("jsonwebtoken");
const { generateOtp, sendOtpEmail, sendOtpSMS } = require("../services/otpConfig");
const User = require("../models/user");
const Otp = require("../models/otp");

// Request OTP
exports.requestOtp = async (req, res) => {
  const { email, phoneNumber } = req.body;
  const identifier = email || phoneNumber;

  if (!identifier) return res.status(400).json({ error: "Email or phone number is required" });

  try {
    const otp = await generateOtp(identifier);

    if (email) await sendOtpEmail(email, otp);
    if (phoneNumber) await sendOtpSMS(phoneNumber, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;

  try {
    // Check if OTP is valid
    const validOtp = await Otp.findOne({ identifier, otp });
    if (!validOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Mark OTP as verified
    await Otp.updateOne({ identifier }, { $set: { verified: true } });

    // Check if user exists
    const isEmail = identifier.includes("@");
    let user = await User.findOne(isEmail ? { email: identifier } : { phone: identifier });

    if (!user) {
      return res.json({ message: "OTP verified. Proceed to set password." });
    }

    // Generate a token 
    const token = jwt.sign({ id: identifier }, process.env.JWT_SECRET, { expiresIn: "10m" });

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: err.message });
  }
};
