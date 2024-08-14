const express = require('express');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
require('./passport');
const PORT = process.env.PORT || 8080;
const routerAuth = require('./src/Routes/auth.router');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', routerAuth);

app.get('/error', (req, res) => {
  res.send('Authentication failed!');
});

app.get('/success', (req, res) => {
    if (req.user) {
        req.session.user = req.user;
        console.log('User Info:', req.session.user);
        res.send(`Welcome, ${req.user.displayName}!`);
    } else {
        res.redirect('/error');
    }
});

app.listen(PORT, () => {
  console.log('Server is running on ' + PORT);
});