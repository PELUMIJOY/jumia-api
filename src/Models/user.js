const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String }, 
  name: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  provider: { type: String, enum: ['email', 'google', 'facebook'], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Users", UserSchema);
