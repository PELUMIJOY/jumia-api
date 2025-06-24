// // Import required modules
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const passport = require('passport');
// const User = require("../models/user");

// // Function to initialize Passport strategies
// const initializePassportStrategies = (passport) => {
//   // Google OAuth Strategy
//   passport.use(
//     new GoogleStrategy({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: '/auth/google/callback',
//         passReqToCallback: true  // This allows us to access the role query parameter
//       },
//       async (req, accessToken, refreshToken, profile, done) => {
//         try {
//           // Extract role from query parameter or default to "user"
//           const role = req.query.role || "user";
          
//           // Find existing user or create new one
//           let user = await User.findOne({ googleId: profile.id });
          
//           if (!user) {
//             // Extract first and last name from profile
//             const firstName = profile.name?.givenName || profile.displayName.split(' ')[0] || 'Unnamed';
//             const lastName = profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ') || 'User';
            
//             // Create user with all required fields
//             user = await User.create({
//               googleId: profile.id,
//               name: firstName,
//               lastName: lastName,
//               email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
//               password: require('crypto').randomBytes(16).toString('hex'), // Random secure password
//               provider: 'google',
//               role: role
//             });
//           }
          
//           return done(null, user);
//         } catch (err) {
//           console.error("Google auth error:", err);
//           return done(err, null);
//         }
//       }
//     )
//   );

//   // Facebook OAuth Strategy
//   passport.use(
//     new FacebookStrategy({
//         clientID: process.env.FACEBOOK_APP_ID,
//         clientSecret: process.env.FACEBOOK_APP_SECRET,
//         callbackURL: '/auth/facebook/callback',
//         profileFields: ['id', 'emails', 'name'],
//         passReqToCallback: true  // This allows us to access the role query parameter
//       },
//       async (req, accessToken, refreshToken, profile, done) => {
//         try {
//           // Extract role from query parameter or default to "user"
//           const role = req.query.role || "user";
          
//           // Find existing user or create new one
//           let user = await User.findOne({ facebookId: profile.id });
          
//           if (!user) {
//             // Extract name information
//             const firstName = profile.name?.givenName || 'Unnamed';
//             const lastName = profile.name?.familyName || 'User';
            
//             // Create user with all required fields
//             user = await User.create({
//               facebookId: profile.id,
//               name: firstName,
//               lastName: lastName,
//               email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
//               password: require('crypto').randomBytes(16).toString('hex'), // Random secure password
//               provider: 'facebook',
//               role: role
//             });
//           }
          
//           return done(null, user);
//         } catch (err) {
//           console.error("Facebook auth error:", err);
//           return done(err, null);
//         }
//       }
//     )
//   );

//   // Serialize and deserialize user functions
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

// Import required modules
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const crypto = require('crypto');
const User = require("../models/user");
const dotenv = require("dotenv");

dotenv.config();
// Function to initialize Passport strategies
const initializePassportStrategies = (passport) => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        passReqToCallback: true  // Allow access to request object
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log("Profile", profile)
        try {
          // Get role from session or default to user
          const role = (req.session && req.session.oauthRole) || "user";
          
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });
          
          if (!user) {
            // Extract name information
            const name = profile.displayName || profile.name?.givenName || 'Unnamed';
            const lastName = profile.name?.familyName || 'User';
            const email = profile.emails?.[0]?.value || `${profile.id}@gmail.com`;
            
            // Generate a secure random password
            const password = crypto.randomBytes(16).toString('hex');
            
            // Create new user with all required fields
            user = await User.create({
              googleId: profile.id,
              name: name,
              lastName: lastName,
              email: email,
              password: password,  // Will be hashed by the model's pre-save hook
              provider: 'google',
              role: role
            });
          } else {
            // Update role if needed
            if (role !== user.role) {
              user.role = role;
              await user.save();
            }
          }
          
          return done(null, user);
        } catch (err) {
          console.error("Google OAuth error:", err);
          return done(err, null);
        }
      }
    )
  );

  // Facebook OAuth Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name'],
        passReqToCallback: true  // Allow access to request object
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Get role from session or default to user
          const role = (req.session && req.session.oauthRole) || "user";
          
          // Check if user already exists
          let user = await User.findOne({ facebookId: profile.id });
          
          if (!user) {
            // Extract name information
            const name = profile.displayName || 
                        (profile.name?.givenName || 'Unnamed');
            const lastName = profile.name?.familyName || 'User';
            const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
            
            // Generate a secure random password
            const password = crypto.randomBytes(16).toString('hex');
            
            // Create new user with all required fields
            user = await User.create({
              facebookId: profile.id,
              name: name,
              lastName: lastName,
              email: email,
              password: password,  // Will be hashed by the model's pre-save hook
              provider: 'facebook',
              role: role
            });
          } else {
            // Update role if needed
            if (role !== user.role) {
              user.role = role;
              await user.save();
            }
          }
          
          return done(null, user);
        } catch (err) {
          console.error("Facebook OAuth error:", err);
          return done(err, null);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = {
  initializePassportStrategies,
};