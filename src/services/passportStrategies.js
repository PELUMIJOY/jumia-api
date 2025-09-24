//not used in this project but just keeping this in the codebase

// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;
// const crypto = require("crypto");
// const User = require("../models/user");
// const dotenv = require("dotenv");

// dotenv.config();
// // Function to initialize Passport strategies
// const initializePassportStrategies = (passport) => {
//   // Google OAuth Strategy
//   passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "/auth/google/callback",
//         passReqToCallback: true, // Allow access to request object
//       },
//       async (req, accessToken, refreshToken, profile, done) => {
//         console.log("Profile", profile);
//         try {
//           // Get role from session or default to user
//           const role = (req.session && req.session.oauthRole) || "user";

//           // Check if user already exists
//           // let user = await User.findOne({ googleId: profile.id });

//           // if (!user) {
//           //   // Extract name information
//           //   const name = profile.displayName || profile.name?.givenName || 'Unnamed';
//           //   const lastName = profile.name?.familyName || 'User';
//           //   const email = profile.emails?.[0]?.value || `${profile.id}@gmail.com`;

//           //   // Generate a secure random password
//           //   const password = crypto.randomBytes(16).toString('hex');

//           //   // Create new user with all required fields
//           //   user = await User.create({
//           //     googleId: profile.id,
//           //     name: name,
//           //     lastName: lastName,
//           //     email: email,
//           //     password: password,  // Will be hashed by the model's pre-save hook
//           //     provider: 'google',
//           //     role: role
//           //   });
//           // } else {
//           //   // Update role if needed
//           //   if (role !== user.role) {
//           //     user.role = role;
//           //     await user.save();
//           //   }
//           // }

//           return done(null, _);
//         } catch (err) {
//           console.error("Google OAuth error:", err);
//           return done(err, null);
//         }
//       }
//     )
//   );

//   // Facebook OAuth Strategy
//   passport.use(
//     new FacebookStrategy(
//       {
//         clientID: process.env.FACEBOOK_APP_ID,
//         clientSecret: process.env.FACEBOOK_APP_SECRET,
//         callbackURL: "/auth/facebook/callback",
//         profileFields: ["id", "emails", "name"],
//         passReqToCallback: true, // Allow access to request object
//       },
//       async (req, accessToken, refreshToken, profile, done) => {
//         try {
//           // Get role from session or default to user
//           const role = (req.session && req.session.oauthRole) || "user";

//           // Check if user already exists
//           let user = await User.findOne({ facebookId: profile.id });

//           if (!user) {
//             // Extract name information
//             const name =
//               profile.displayName || profile.name?.givenName || "Unnamed";
//             const lastName = profile.name?.familyName || "User";
//             const email =
//               profile.emails?.[0]?.value || `${profile.id}@facebook.com`;

//             // Generate a secure random password
//             const password = crypto.randomBytes(16).toString("hex");

//             // Create new user with all required fields
//             user = await User.create({
//               facebookId: profile.id,
//               name: name,
//               lastName: lastName,
//               email: email,
//               password: password, // Will be hashed by the model's pre-save hook
//               provider: "facebook",
//               role: role,
//             });
//           } else {
//             // Update role if needed
//             if (role !== user.role) {
//               user.role = role;
//               await user.save();
//             }
//           }

//           return done(null, user);
//         } catch (err) {
//           console.error("Facebook OAuth error:", err);
//           return done(err, null);
//         }
//       }
//     )
//   );

//   // Serialize and deserialize user
//   passport.serializeUser((user, done) => {
//     done(null, user.id);
//   });

//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await User.findById(id);
//       done(null, user);
//     } catch (err) {
//       done(err, null);
//     }
//   });
// };

// module.exports = {
//   initializePassportStrategies,
// };
