const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../Controllers/auth.controller');
const userController = require('../Controllers/user.controller');
const middleware = require('../Middleware/verifyToken');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/error'
  }),
  authController.callbackGoogle
);

router.get('/auth/facebook',
  passport.authenticate('facebook'
  //   , {
  //   scope: ['profile', 'email']
  // }
));


router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

router.post('/refreshToken', authController.refreshToken);

router.get('/auth/logout', authController.logout);

router.get('/user/:id', middleware.verifyToken, userController.getUserById);

router.post('/auth/forgotPassword', authController.forgotPassword);

router.post('/auth/checkOTP', authController.checkOTP);

router.post('/auth/updatePassword', authController.updatePass);

router.post('/auth/login', authController.login);

module.exports = router;