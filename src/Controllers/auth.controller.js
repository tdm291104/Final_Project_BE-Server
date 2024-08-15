const authServices = require('../Services/auth.service');

const register = async (req, res) => {
    const user = req.body;
    const query_user = await authServices.register(user);
    if (query_user === 'USER_EXISTS') {
        return res.status(400).json({ message: 'USER_EXISTS' });
    }
    res.json(query_user);
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

module.exports = { register, login };