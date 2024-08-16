const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const conn = require('../Database/connection');

const register = async (user) => {
    try {
        const check = await conn.query('SELECT * FROM users WHERE email = ?', user.email);
        if(check[0].length > 0) return 'USER_EXISTS';
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
        await conn.query('INSERT INTO users SET ?', user);
        return user;
    } catch (e) {
        console.log(e);
    }  
}


const login = async (user) => {
    try {
        const [query_user] = await conn.query('SELECT * FROM users WHERE email = ?', [user.email]);

        if (query_user.length === 0) return 'USER_NOT_FOUND';

        const userRecord = query_user[0];
        const compare = await bcrypt.compare(user.password, userRecord.password);

        if (!compare) return 'PASSWORD_WRONG';

        const token = jwt.sign({ id: userRecord.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        const refreshToken = jwt.sign(
            { id: userRecord.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        return {
            message: 'Login successfully',
            token: token,
            refreshToken: refreshToken,
            id: userRecord.id, 
        };
    } catch (e) {
        console.log(e);
        throw new Error('Login failed');
    }
};

module.exports = { register, login };