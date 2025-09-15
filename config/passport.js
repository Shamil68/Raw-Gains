const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/userSchema'); // your mongoose user schema


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // check if user exists in DB
      let user = await User.findOne({ googleId: profile.id });
        if (user) {
      // already exists → login
      return done(null, user);
    } else {
      // new user → signup
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        avatar: profile.photos[0].value
      });
      await newUser.save();
      return done(null, newUser);
    }
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id); // store user id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
