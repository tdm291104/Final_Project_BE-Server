const authServices = require('../Services/auth.service');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userController = require('./user.controller');

const sendMail = require('../utils/sendMail');
const redis = require('redis');
const userServices = require('../Services/user.service');
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.connect().catch(console.error);

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const register = async (req, res) => {
    try {
        const user = await authServices.register(req.body);
        if (user.error) {
            return res.status(400).json(user.error);
        } else if (user === "USER_EXISTS") {
            return res.status(400).json({
                message: 'USER_EXISTS'
            });
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
    try {
        const user = req.body;
        const query_user = await authServices.login(user);
        if (query_user === 'USER_NOT_FOUND') {
            return res.status(400).json({
                message: 'User Not Found'
            });
        }
        if (query_user === 'PASSWORD_WRONG') {
            return res.status(400).json({
                message: 'Password Wrong'
            });
        }
        res.status(200).json({
            token: query_user.token,
            refreshToken: query_user.refreshToken,
            id: query_user.id
        });


    } catch (error) {
        res.status(500).send('An error occurred');
    }
}

const logout = (req, res) => {
    req.logout(err => {
      if (err) {
        return res.status(500).send('An error occurred');
      }

      req.session.destroy(err => {
        if (err) {
          return res.status(500).send('Failed to destroy session');
        }
  
        // Clear cookies
        res.clearCookie('refreshToken');
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    });
  };
  

const refreshToken = async (req, res) => {
    const {
        refreshToken
    } = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            message: 'REFRESH_FAIL'
        });
    }
    try {
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        const newAccessToken = jwt.sign({
                id: payload.id,
                email: payload.email
            },
            JWT_SECRET, {
                expiresIn: '15m'
            }
        );
        res.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        res.status(403).json({
            message: 'Invalid refresh token'
        });
    }
}
const callbackGoogle = async (req, res) => {
    try {
        const user = await userController.getUserByGoogleId(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: 'USER_NOT_FOUND'
            });
        }

        const token = jwt.sign({
                id: user.id
            },
            ACCESS_TOKEN_SECRET, {
                expiresIn: '15m'
            }
        );

        const refreshToken = jwt.sign({
                id: user.id
            },
            REFRESH_SECRET, {
                expiresIn: '1d'
            }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 1 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.redirect(`https://sgroup.dilysnguyen.io.vn/Dashboard?id=${user.id}&token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
        console.error('Error in callbackGoogle:', error);
        res.status(500).json({
            message: 'INTERNAL_SERVER_ERROR'
        });
    }
};

const callbackFacebook = async (req, res) => {
    const user = await userController.getUserByFaceId(req.user.facebookId);
    if (!user) {
        return res.status(404).json({
            message: 'USER_NOT_FOUND'
        });
    }

    const token = jwt.sign({
            id: user.id
        },
        ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        }
    );

    const refreshToken = jwt.sign({
            id: user.id
        },
        REFRESH_SECRET, {
            expiresIn: '1d'
        }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: '/'
    });

    res.redirect(`https://sgroup.dilysnguyen.io.vn/Dashboard?id=${user.id}&token=${token}&refreshToken=${refreshToken}`);
};

const forgotPassword = async (req, res) => {
    const {
        email
    } = req.body;
    const user = await userServices.getByEmail(email);
    if (!user) {
        return res.status(404).json({
            message: 'USER_NOT_FOUND'
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendMail.sendMail(email, otp);
    console.log(otp);
    await redisClient.setEx(email, 300, otp.toString());

    setTimeout(async () => {
        await redisClient.del(email);
        console.log(`OTP deleted`);
    }, 15000);

    res.json({
        message: 'OTP_SENT'
    });
}

const checkOTP = async (req, res) => {
    const {
        email,
        otp
    } = req.body;
    const user = await userServices.getByEmail(email);
    if (!user) {
        return res.status(404).json({
            message: 'USER_NOT_FOUND'
        });
    }
    const storedOtp = await redisClient.get(email);
    if (otp !== storedOtp) {
        return res.status(400).json({
            message: 'OTP_WRONG'
        });
    }

    res.json({
        message: 'OTP_CORRECT'
    });
    await redisClient.del(email);
}

const updatePass = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    const user = await userServices.getByEmail(email);
    if (!user) {
        return res.status(404).json({
            message: 'USER_NOT_FOUND'
        });
    }
    await userServices.updatePass(email, password);
    res.json({
        message: 'Password Updated'
    });
}

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    callbackGoogle,
    callbackFacebook,
    forgotPassword,
    checkOTP,
    updatePass
};