const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const connection = require('./src/Database/connection');
require('dotenv').config();


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName']
}, 
async (accessToken, refreshToken, profile, done) => {
  // In ra thông tin profile nhận được từ Facebook
  console.log('Facebook Profile:', profile); 

  try {
    const [rows] = await connection.query('SELECT * FROM users WHERE googleId = ?', [profile.id]);
    let user = rows[0];

    const password = Math.random().toString(36).slice(-8);
    const hashPassword = await bcrypt.hash(password, 10);

    if (!user) {
      const email = profile.emails ? profile.emails[0].value : null;
      const [result] = await connection.query('INSERT INTO users (googleId, displayName, email, password) VALUES (?, ?, ?, ?)', [
        profile.id,
        profile.displayName,
        email,
        hashPassword
      ]);
      user = { id: result.insertId, facebookId: profile.id, displayName: profile.displayName, email: email };
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// passport.deserializeUser(async (id, done) => {
//   try {
//     const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
//     const user = rows[0];
//     if (!user) {
//       return done(new Error('User not found'), null);
//     }
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });
