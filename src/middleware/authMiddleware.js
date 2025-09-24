const { auth } = require("../utils/auth.js");

// Authentication middleware using Better-Auth
const verifyToken = async (req, res, next) => {
  try {
    // Get session token from cookie or Authorization header
    let token = req.cookies["better-auth.session_token"];

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, Token required",
      });
    }

    // Verify session with Better-Auth
    const session = await auth.api.getSession({
      headers: {
        ...req.headers,
        cookie: `better-auth.session_token=${token}`,
      },
    });

    if (!session.user) {
      return res.status(403).json({
        message: "Invalid Token",
      });
    }

    // Attach user data to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      lastName: session.user.lastName,
      role: session.user.role,
      phone: session.user.phone,
      country: session.user.country,
      shoppingZone: session.user.shoppingZone,
      shopName: session.user.shopName,
      accountType: session.user.accountType,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({
      message: "Authentication failed",
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies["better-auth.session_token"];

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      try {
        const session = await auth.api.getSession({
          headers: {
            ...req.headers,
            cookie: `better-auth.session_token=${token}`,
          },
        });

        if (session.user) {
          req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            lastName: session.user.lastName,
            role: session.user.role,
            phone: session.user.phone,
            country: session.user.country,
            shoppingZone: session.user.shoppingZone,
            shopName: session.user.shopName,
            accountType: session.user.accountType,
          };
        }
      } catch (error) {
        console.log("Optional auth - invalid token:", error.message);
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};

module.exports = {
  verifyToken,
  authorizeRoles,
  optionalAuth,
};
