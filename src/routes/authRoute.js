const express = require("express");
const passport = require("passport");
const { signup, login, logout, getProtectedData } = require("../controller/authController.js");
const verifyToken = require("../middleware/authMiddleware.js");
const { oauthCallback } = require("../controller/oauthController.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/protected", verifyToken, getProtectedData);

router.get(
  "/google",
  (req, res, next) => {
    // Store role in query parameters to access it in the strategy
    const role = req.query.role || "user";
    req.session = req.session || {};
    req.session.oauthRole = role;
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", ),
  oauthCallback
);

// Facebook OAuth routes with role parameter support
router.get(
  "/facebook",
  (req, res, next) => {
    // Store role in query parameters to access it in the strategy
    const role = req.query.role || "user";
    req.session = req.session || {};
    req.session.oauthRole = role;
    next();
  },
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  oauthCallback
);

module.exports = router;
