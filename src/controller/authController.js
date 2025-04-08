const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Otp = require("../models/otp");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// 🟢 Signup
exports.signup = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      lastName, 
      phone, 
      provider, 
      role, 
      country, 
      shoppingZone, 
      shopName, 
      accountType 
    } = req.body;

    if (!["vendor", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!provider || !["email", "google", "facebook", "phone"].includes(provider)) {
      return res.status(400).json({ message: "Invalid provider" });
    }

    // Ensure OTP verification
    const otpRecord = await Otp.findOne({ identifier: email, verified: true });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP verification required before signing up." });
    }

    // Check for existing user
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create user data object based on role
    let userData = {
      email,
      password, // Password will be hashed by pre-save hook in the model
      name,
      lastName,
      phone,
      provider,
      role
    };

    // Add vendor-specific fields if role is vendor
    if (role === "vendor") {
      if (!country || !shoppingZone || !shopName || !accountType) {
        return res.status(400).json({ 
          message: "Missing required vendor fields", 
          requiredFields: ["country", "shoppingZone", "shopName", "accountType"] 
        });
      }

      userData = {
        ...userData,
        country,
        shoppingZone,
        shopName,
        accountType
      };
    }

    // Create new user with all required fields
    const newUser = await User.create(userData);

    const token = generateToken(newUser);

    res.cookie("token", token, { httpOnly: true, secure: true });

    // Remove OTP after successful signup
    await Otp.deleteOne({ identifier: email });

    res.status(201).json({ 
      message: "User registered successfully", 
      user: {
        ...newUser.toObject(),
        password: undefined  // Don't send password back to client
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

// 🟢 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, { httpOnly: true, secure: true });

    res.status(200).json({
      message: "Login successful",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🟢 Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// 🛑 Protected Route
exports.getProtectedData = (req, res) => {
  res.json({ message: "Protected Data Access Granted", user: req.user });
};
