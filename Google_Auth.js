const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const connection = require('./src/Database/connection');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/google/callback'
}, 
async (accessToken, refreshToken, profile, done) => {
  const [rows] = await connection.query('SELECT * FROM users WHERE googleId = ?', [profile.id]);
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

  return done(null, profile);
}));

// passport.use(new LocalStrategy(async (username, password, done) => {
//   const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
//   const user = rows[0];

//   if (!user) {
//     return done(null, false, { message: 'User not found' });
//   }

//   const validPassword = await bcrypt.compare(password, user.password);

//   if (!validPassword) {
//     return done(null, false, { message: 'Password is not correct' });
//   }

//   return done(null, user);
// }));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser1(async (id, done) => {
  try {
    const [rows] = await connection.query('SELECT * FROM users WHERE googleId = ?', [id]);
    const user = rows[0];
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});