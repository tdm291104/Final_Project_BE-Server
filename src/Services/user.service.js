const conn = require('../Database/connection');
const bcrypt = require('bcryptjs');

const getAll = async () => {
    try {
        const users = await conn.query('SELECT id, googleId, displayName, email FROM users');
        return users[0];
    } catch (e) {
        console.log(e);
    }
}

const getOne = async (id) => {
    try {
        const [user] = await conn.query('SELECT id, googleId, displayName, email FROM users WHERE id = ?', [id]);
        return user[0];
    } catch (e) {
        console.log(e);
    }
}

const getByGoogleId = async (googleId) => {
    try {
        const [user] = await conn.query('SELECT id, googleId, displayName, email FROM users WHERE googleId = ?', [googleId]);
        return user[0];
    } catch (e) {
        console.log(e);
    }
}

const getByEmail = async (email) => {
    try {
        const [user] = await conn.query('SELECT id, googleId, displayName, email FROM users WHERE email = ?', [email]);
        return user[0];
    } catch (e) {
        console.log(e);
    }
}

const updatePass = async (email, password) => {
    try {
        const hash = await bcrypt.hash(password, 10);
        await conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
        return 'Password Updated';
    } catch (e) {
        console.log(e);
    }
}

module.exports = { getAll, getOne, getByGoogleId, getByEmail, updatePass };