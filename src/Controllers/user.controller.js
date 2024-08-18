const userServices = require('../Services/user.service');

const getUserById = async (req, res) => {
    const id = req.params.id;
    const user = await userServices.getOne(id);
    if (!user) {
        return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }
    res.json(user);
}

async function getUserByGoogleId (googleId) {
    const user = await userServices.getByGoogleId(googleId);
    return user;
}

module.exports = { getUserById, getUserByGoogleId };