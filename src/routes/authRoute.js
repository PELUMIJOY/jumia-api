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
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    accessType: "offline",
    approvalPrompt: "force",
   })
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", ),
//   oauthCallback
// );
// router.get(
//     "/google/callback",
//       (req, res, next) => {
//     // Store role in query parameters to access it in the strategy
//     const role = req.query.role || "user";
//     console.log("session before", req.session)
//     req.session = req.session || {};
//     req.session.oauthRole = role;
//     console.log("session after", req.session)
// console.log("client id",process.env.GOOGLE_CLIENT_ID)
// console.log("cleint secret",process.env.GOOGLE_CLIENT_SECRET)
//     console.log(req.query, "request")
//       passport.authenticate("google",{
//         // session:false,
//         // keepSessionInfo:true,
//         failureRedirect:'/auth/google'
//       })(req, res, next)
//   },

// )

router.get(
  '/google/callback',
   passport.authenticate('google'), // complete the authenticate using the google strategy
  (err, req, res, next) => { // custom error handler to catch any errors, such as TokenError
    if (err.name === 'TokenError') {
     res.redirect('/auth/google'); // redirect them back to the login page
    } else {
     // Handle other errors here
    }
  },
  (req, res) => { // On success, redirect back to '/'
    res.redirect('/');
  }
)
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
