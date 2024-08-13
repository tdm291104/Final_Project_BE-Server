require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.sendStatus(401);

    tokenNew = token.replace('Bearer ', '');
    
    await jwt.verify(tokenNew, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
    });
    next();
}

module.exports = { verifyToken };