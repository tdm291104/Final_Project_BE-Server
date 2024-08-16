const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../Controllers/auth.controller');
const userController = require('../Controllers/user.controller');
const middleware = require('../Middleware/verifyToken');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  authController.callbackGoogle
);

router.post('/refreshToken', authController.refreshToken);

router.get('/logout', authController.logout);

router.get('/user/:id', middleware.verifyToken, userController.getUserById);

module.exports = router;