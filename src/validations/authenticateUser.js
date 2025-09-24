const { auth } = require("../utils/auth");

// Authentication middleware using Better-Auth
const authenticateUser = async (req, res, next) => {
  try {
    let sessionToken;
    let session = null;

    // Method 1: get session from Better-Auth directly using cookies
    try {
      session = await auth.api.getSession({
        headers: req.headers, // Pass all headers including cookies
      });
    } catch (sessionError) {
      console.log("Direct session lookup failed:", sessionError.message);
    }

    // Method 2: If direct lookup fails,  extract token manually
    if (!session?.user) {
      // Prefer session cookie set by Better-Auth
      if (req.cookies && req.cookies["better-auth.session_token"]) {
        sessionToken = req.cookies["better-auth.session_token"];
      }
      // Fallback: allow passing token in Authorization header
      else if (req.headers.authorization?.startsWith("Bearer")) {
        sessionToken = req.headers.authorization.split(" ")[1];
      }

      if (sessionToken) {
        try {
          // Validate session with Better-Auth using the extracted token
          session = await auth.api.getSession({
            headers: {
              cookie: `better-auth.session_token=${sessionToken}`,
            },
          });
        } catch (tokenError) {
          console.log("Token-based session lookup failed:", tokenError.message);
        }
      }
    }

    // If still no session found, return error
    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No valid session found.",
      });
    }

    // Validate session user
    if (!session.user.id) {
      return res.status(401).json({
        success: false,
        error: "Invalid session data.",
      });
    }

    // Attach user to request
    req.user = session.user;
    req.userId = session.user.id;
    req.session = session;

    console.log("Authenticated user:", session.user.id, session.user.email);

    next();
  } catch (error) {
    console.error("Better-Auth middleware error:", error.message);
    res.status(500).json({
      success: false,
      error: "Authentication failed.",
    });
  }
};

// Optional: Middleware for routes that should work for both authenticated and unauthenticated users
const optionalAuth = async (req, res, next) => {
  try {
    let session = null;

    //  get session from Better-Auth
    try {
      session = await auth.api.getSession({
        headers: req.headers,
      });
    } catch (sessionError) {
      // Session not found or invalid, but that's okay for optional auth
    }

    // If session exists, attach user data
    if (session?.user) {
      req.user = session.user;
      req.userId = session.user.id;
      req.session = session;
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error.message);
    // Don't fail the request, just continue without user data
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
};
