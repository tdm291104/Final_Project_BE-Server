const db = require("../Database/connection");

const verifyUser = async (req, res, next) => {
    try {
        const { user_id, role } = req.user;
        console.log(user_id, role);
        if (!user_id) {
            return res.status(401).json({
                message: 'user_id is invalid '
            });
        }
        // const [check] = await db.query(`select role from users where user_id = ?`, user_id);
        // console.log (check[0].role);
        if (role === "admin") {
            next();
        } else {
            return res.status(401).json({
                message: 'error with role'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
}
module.exports = verifyUser