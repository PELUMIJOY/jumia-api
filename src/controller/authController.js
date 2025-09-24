const { auth } = require("../utils/auth.js");

exports.signup = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      lastName,
      phone,
      role,
      country,
      shoppingZone,
      shopName,
      accountType,
    } = req.body;

    // Validate role
    if (!["vendor", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prepare user data
    let userData = {
      email,
      password,
      name,
      role,
      phone: phone || "",
      lastName: lastName || "",
    };

    // Add vendor-specific fields if role is vendor
    if (role === "vendor") {
      if (!country || !shoppingZone || !shopName || !accountType) {
        return res.status(400).json({
          message: "Missing required vendor fields",
          requiredFields: [
            "country",
            "shoppingZone",
            "shopName",
            "accountType",
          ],
        });
      }

      userData = {
        ...userData,
        country,
        shoppingZone,
        shopName,
        accountType,
      };
    }

    // Create user with Better-Auth
    const result = await auth.api.signUpEmail({
      body: userData,
      headers: req.headers,
    });

    if (!result.user) {
      return res.status(400).json({
        message: "Failed to create account",
      });
    }

    // Set session cookie
    if (result.token) {
      res.cookie("better-auth.session_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        lastName: result.user.lastName,
        role: result.user.role,
        phone: result.user.phone,
        country: result.user.country,
        shoppingZone: result.user.shoppingZone,
        shopName: result.user.shopName,
        accountType: result.user.accountType,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle specific Better-Auth errors
    if (error.message?.includes("User already exists")) {
      return res.status(400).json({ message: "Email already in use" });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Sign in with Better-Auth
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: req.headers,
    });

    console.log("Better-Auth login result:", result);

    if (!result.user || !result.token) {
      console.log("Login failed - no user or token in result");
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Set session cookie
    res.cookie("better-auth.session_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        lastName: result.user.lastName,
        role: result.user.role,
        phone: result.user.phone,
        country: result.user.country,
        shoppingZone: result.user.shoppingZone,
        shopName: result.user.shopName,
        accountType: result.user.accountType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error details:", error.response?.data || error.message);

    if (
      error.message?.includes("Invalid credentials") ||
      error.message?.includes("User not found") ||
      error.response?.status === 400
    ) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies["better-auth.session_token"];

    if (sessionToken) {
      // Sign out with Better-Auth
      await auth.api.signOut({
        headers: {
          ...req.headers,
          cookie: `better-auth.session_token=${sessionToken}`,
        },
      });
    }

    // Clear the session cookie
    res.clearCookie("better-auth.session_token");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookie even if Better-Auth call fails
    res.clearCookie("better-auth.session_token");
    res.json({ message: "Logged out successfully" });
  }
};

//  Protected Route - Get user data
exports.getProtectedData = async (req, res) => {
  try {
    // User data is already attached by middleware
    res.json({
      message: "Protected Data Access Granted",
      user: req.user,
    });
  } catch (error) {
    console.error("Protected route error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
