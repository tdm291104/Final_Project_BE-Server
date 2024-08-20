const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const connection = require('./src/Database/connection');
require('dotenv').config();

// Google Strategy

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/google/callback'
}, 
async (accessToken, refreshToken, profile, done) => {
  const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
  let user = rows[0];

  const password = Math.random().toString(36).slice(-8);
  const hashPassword = await bcrypt.hash(password, 10);

  if (!user) {
    const [result] = await connection.query('INSERT INTO users (googleId, displayName, email, password) VALUES (?, ?, ?, ?)', [
      profile.id,
      profile.displayName,
      profile.emails[0].value,
      hashPassword
    ]);
    user = { id: result.id, googleId: profile.id, displayName: profile.displayName, email: profile.emails[0].value };
  }

  if (!user.googleId){
    await connection.query('UPDATE users SET googleId = ? WHERE email = ?', [profile.id, profile.emails[0].value]);
  }

  return done(null, profile);
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/api/v1/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'displayName']
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('Facebook Profile:', profile);

    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
      let user = rows[0];

      const password = Math.random().toString(36).slice(-8);
      const hashPassword = await bcrypt.hash(password, 10);

      if (!user) {
        const [result] = await connection.query('INSERT INTO users (facebookId, displayName, email, password) VALUES (?, ?, ?, ?)', [
          profile.id,
          profile.displayName,
          [profile.emails[0].value],
          hashPassword
        ]);
        user = {
          id: result.insertId,
          facebookId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value
        };
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE id = ? OR googleId = ? OR facebookId = ?', 
      [id, id, id]
    );
    
    const user = rows[0];
    
    if (!user) {
      return done(new Error('User not found'), null);
    }
    
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


module.exports = passport;