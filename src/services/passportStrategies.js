// Import required modules
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const Users = require('../Models/user');


// Function to initialize Passport strategies
const initializePassportStrategies = (passport) => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await Users.findOne({ googleId: profile.id });
          if (!user) {
            user = await Users.create({
              googleId: profile.id,
              name: profile.displayName || 'Unnamed User',
              email: profile.emails?.[0]?.value || undefined,
              provider: 'google',
            });
          }
          return done(null, user);
        } catch (err) {
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
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await Users.findOne({ facebookId: profile.id });
          if (!user) {
            user = await Users.create({
              facebookId: profile.id,
              name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
              email: profile.emails?.[0]?.value || undefined,
              provider: 'facebook',
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

};

module.exports = {
  initializePassportStrategies,
};
