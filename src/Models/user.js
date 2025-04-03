const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // Common fields for all users
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,  },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ["email", "google", "facebook", "phone"], required: true },
    role: { type: String, enum: ["user", "vendor", "admin"], required: true },
    
    // Vendor specific fields
    country: { type: String, required: function() { return this.role === "vendor"; } },
    shoppingZone: { type: String, required: function() { return this.role === "vendor"; } },
    shopName: { type: String, required: function() { return this.role === "vendor"; } },
    accountType: { type: String, enum: ["Business", "Individual"], required: function() { return this.role === "vendor"; } },
    
    // Other optional fields that might be needed later
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" }
  },
  { timestamps: true }
);

// Automatically hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
