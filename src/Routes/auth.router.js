const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    //Trả thông tin user về cho client
    res.json(req.user);
  }
);

module.exports = router;