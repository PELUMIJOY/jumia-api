// const jwt = require("jsonwebtoken");

// exports.oauthCallback = (req, res) => {
//   try {
//     if (!req.user || !req.user.email) {
//       return res.status(400).json({ error: "User email not found in request." });
//     }

//     const { email } = req.user;
//     res.redirect(`/auth/send-otp?email=${encodeURIComponent(email)}`);
//   } catch (error) {
//     console.error("Error in OAuth callback:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
const jwt = require("jsonwebtoken");

exports.oauthCallback = (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: "User email not found in request." });
    }

    // Get the role from user object or session
    const role = req.user.role || (req.session && req.session.oauthRole) || "user";
    
    // Create a JWT token with user information
    const token = jwt.sign(
      { 
        id: req.user._id, 
        email: req.user.email,
        role: role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Determine redirect based on role - you can customize this
    let redirectUrl = "/";
    if (role === "vendor") {
      redirectUrl = "/vendor";
    } else if (role === "user") {
      redirectUrl = "/cart";
    }

    // Redirect with token
    res.redirect(`${redirectUrl}?token=${token}`);
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};