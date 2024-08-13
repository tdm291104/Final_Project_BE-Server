const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const conn = require('../Database/connection');

const register = async (user) => {
    try {
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
        const check = await conn.query('SELECT * FROM users WHERE username = ?', user.username);
        if(check[0].length === 0) return 'User Not Found';
        const compare = await bcrypt.compare(user.password, check[0][0].password);

        const token = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        
        if(!compare) return 'Password Wrong';
        return token;
    } catch (e) {
        console.log(e);
    }
}