const express = require('express');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
// require('./Google_Auth');
require('./Facebook_Auth');
const morgan = require('morgan');
const PORT = process.env.PORT || 8080;
const routerAuth = require('./src/Routes/router');
const cors = require('cors');
const app = express();
// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true
}));

// redisClient.connect().catch(console.error);

// redisClient.on('error', (err) => console.error('Redis Client Error', err));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
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