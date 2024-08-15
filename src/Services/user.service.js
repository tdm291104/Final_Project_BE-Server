const conn = require('../Database/connection');

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

module.exports = { getAll, getOne, getByGoogleId };