const authServices = require('../Services/auth.service');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userController = require('./user.controller')

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const register = async(req, res) =>
{
    try {
        const user = await authServices.register(req.body);
        if (user.error)
        {
            return res.status(400).json(user.error);
        }
        else if (user === "USER_EXISTS")
        {
            return res.status(400).json({ message: 'USER_EXISTS' });
        }
        res.status(201).json({
            message: "Registered successfully",
            user: user
        })
        
    } catch (error) {
        res.status(500).send('An error occurred');
        
    }
}

const login = async (req, res) => {
    const user = req.body;
    const query_user = await authServices.login(user);
    if (query_user === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: 'User Not Found' });
    }
    if (query_user === 'PASSWORD_WRONG') {
        return res.status(400).json({ message: 'Password Wrong' });
    }
    res.json(query_user);
}

const logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.redirect('/');
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'REFRESH_FAIL' });
    }
    try {
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        const newAccessToken = jwt.sign(
        { id: payload.id, email: payload.email },
        JWT_SECRET,
        { expiresIn: '15m' }
        );
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
}

const callbackGoogle = async (req, res) => {
    const user = await userController.getUserByGoogleId(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }

    const token = jwt.sign(
      { id: user.id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.redirect(`/login/success?token=${token}&refreshToken=${refreshToken}`);
}
    

module.exports = { register, login, logout, refreshToken, callbackGoogle };