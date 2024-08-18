const express = require('express');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('./Google_Auth');
require('./Facebook_Auth');
const morgan = require('morgan');
const PORT = process.env.PORT || 8080;
const routerAuth = require('./src/Routes/router');
const cors = require('cors');
const app = express();

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
const corsOption = {
  origin: ['http://localhost:3001'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}
app.use(cors(corsOption));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  } // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));
app.use('/api/v1', routerAuth);

app.listen(PORT, () => {
  console.log('Server is running on ' + PORT);
});