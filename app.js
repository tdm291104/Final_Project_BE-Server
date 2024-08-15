const express = require('express');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
require('./passport');
const PORT = process.env.PORT || 8080;
const routerAuth = require('./src/Routes/router');

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

app.use('/api/v1', routerAuth);

app.listen(PORT, () => {
  console.log('Server is running on ' + PORT);
});