const express = require("express");
const passport = require("passport");
const { signup, login, logout, getProtectedData } = require("../Controller/authController.js");
const verifyToken = require("../middleware/authMiddleware.js");
const { oauthCallback } = require("../Controller/OauthController.js");
// const {
//   signup,
//   login,
//   logout,
//   getProtectedData,
// } = require("../controllers/authController");
// const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/protected", verifyToken, getProtectedData);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  oauthCallback
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  oauthCallback
);

module.exports = router;
