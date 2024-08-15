const express = require('express');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
require('./passport');
const PORT = process.env.PORT || 8080;
const routerAuth = require('./src/Routes/router');

const app = express();
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

redisClient.on('error', (err) => console.error('Redis Client Error', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({ client: redisClient }),
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