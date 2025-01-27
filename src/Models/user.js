// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   email: { type: String, unique: true, sparse: true },
//   phoneNumber: { type: String, unique: true, sparse: true },
//   password: { type: String },
//   name: { type: String },
//   googleId: { type: String, unique: true, sparse: true },
//   facebookId: { type: String, unique: true, sparse: true },
//   provider: { type: String, enum: ['email', 'google', 'facebook'], required: true },
// }, { timestamps: true });

// module.exports = mongoose.model("Users", UserSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    provider: {
      type: String,
      enum: ["email", "google", "facebook"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
