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
    try{
        const query_user = await conn.query('SELECT * FROM users WHERE username = ?', user.username);
        if(query_user[0].length === 0) return 'USER_NOT_FOUND';
        const compare = await bcrypt.compare(user.password, check[0][0].password);

        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
        
        if(!compare) return 'PASSWORD_WRONG';
        return {
            token: token,
            refreshToken: refreshToken,
            id: user.id, 
        };
    } catch (e) {
        console.log(e);
    }
}

module.exports = { register, login };