const twilio = require('twilio');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const generateOtp = async (identifier) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  await Otp.create({ identifier, otp, createdAt: new Date() });
  return otp;
};

const sendOtpEmail = async (email, otp) => {
  const message = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
  };

  try {
    await sgMail.send(message);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending email with SendGrid:', error);
    throw new Error('Failed to send OTP email');
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
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send OTP SMS');
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
  sendOtpSMS,
};