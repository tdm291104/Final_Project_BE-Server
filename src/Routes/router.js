const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../Controllers/auth.controller');
const userController = require('../Controllers/user.controller');
const middleware = require('../Middleware/verifyToken');

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async (req, res) => {
    const user = await userController.getUserByGoogleId(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    console.log(token)

    res.redirect(`/login/success?token=${token}`);
  }
);

router.get('/user/:id', middleware.verifyToken, userController.getUserById);

module.exports = router;