require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    console.log(token);
    if (!token) {
        res.sendStatus(401);
        return 401;
    }
    const tokenNew = token.replace('Bearer ', '');
    if (tokenNew === 'null' || tokenNew === '') {
        res.sendStatus(401);
        return 401;
    }
    jwt.verify(tokenNew, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err){
            res.sendStatus(403);
            return 403;
        }
        req.user = user;
    });
    next();
}

module.exports = { verifyToken };