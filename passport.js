const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const connection = require('./src/Database/connection');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/google/callback'
}, 
async (accessToken, refreshToken, profile, done) => {
  const [rows] = await connection.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
  let user = rows[0];

  if (!user) {
    const [result] = await db.query('INSERT INTO users (googleId, displayName, email, photo) VALUES (?, ?, ?, ?)', [
      profile.id,
      profile.displayName,
      profile.emails[0].value,
      profile._json.picture
    ]);
    user = { id: result.id, googleId: profile.id, displayName: profile.displayName, email: profile.emails[0].value, photo: profile._json.picture };
  }

  return done(null, profile);
}));

passport.use(new LocalStrategy(async (username, password, done) => {
  const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];

  if (!user) {
    return done(null, false, { message: 'User not found' });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return done(null, false, { message: 'Password is not correct' });
  }

  return done(null, user);
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
  const user = rows[0];
  done(null, user);
});