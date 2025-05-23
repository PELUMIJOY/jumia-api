const mongoose = require("mongoose");
const twilio = require("twilio");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const Otp = require("../models/otp");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILLO_SID, process.env.TWILLO_AUTH_TOKEN);

const generateOtp = async (identifier) => {
  const otpCode = crypto.randomInt(100000, 999999).toString();
  await Otp.create({ identifier, otp: otpCode, createdAt: new Date() });
  return otpCode;
};

const sendOtpEmail = async (email, otp) => {
  const message = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
  };

  try {
    await sgMail.send(message);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending email with SendGrid:", error);
    throw new Error("Failed to send OTP email");
  }
};

const sendOtpSMS = async (phoneNumber, otp) => {
  try {
    await twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });
    console.log(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send OTP SMS");
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
  sendOtpSMS,
};

// const crypto = require("crypto");
// const sgMail = require("@sendgrid/mail");
// const twilio = require("twilio");
// const Otp = require("../models/Otp");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const twilioClient = twilio(process.env.TWILLO_SID, process.env.TWILLO_AUTH_TOKEN);

// // Generate OTP
// exports.generateOtp = async (identifier) => {
//   const otpCode = crypto.randomInt(100000, 999999).toString();
//   await Otp.create({ identifier, otp: otpCode, createdAt: new Date() });
//   return otpCode;
// };

// // Send OTP via Email
// exports.sendOtpEmail = async (email, otp) => {
//   const message = {
//     to: email,
//     from: process.env.SENDGRID_FROM_EMAIL,
//     subject: "Your OTP Code",
//     text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
//     html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
//   };

//   try {
//     await sgMail.send(message);
//     console.log(`OTP sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// };

// // Send OTP via SMS
// exports.sendOtpSMS = async (phoneNumber, otp) => {
//   try {
//     await twilioClient.messages.create({
//       to: phoneNumber,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
//     });
//     console.log(`OTP sent to ${phoneNumber}`);
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     throw new Error("Failed to send OTP SMS");
//   }
// };
