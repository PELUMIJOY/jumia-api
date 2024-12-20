const jwt = require('jsonwebtoken');
const { generateOtp, sendOtpEmail, sendOtpSMS } = require('../services/OtpConfig');
const Otp = require('../Models/otp');
const Users = require('../Models/user');

const requestOtp = async (req, res) => {
  const { email, phoneNumber } = req.body;
  const identifier = email || phoneNumber;

  if (!identifier) return res.status(400).json({ error: 'Email or phone number is required' });

  try {
    const otp = await generateOtp(identifier);

    if (email) await sendOtpEmail(email, otp);
    if (phoneNumber) await sendOtpSMS(phoneNumber, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ identifier, otp });
    if (!validOtp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    let user = await Users.findOne({ $or: [{ email: identifier }, { phoneNumber: identifier }] });

    if (!user) {
      user = await Users.create({ email: identifier, phoneNumber: identifier, provider: 'email' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  requestOtp,
  verifyOtp
};