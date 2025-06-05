const User = require('../../models/User');
const statisticalUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'client' });
        const dateNow = new Date();
        const dayNow = dateNow.getDate();
        const newUsers = users.filter((user) => {
            return (
                dateNow.getTime() - user.createdAt.getTime() <=
                dayNow * 24 * 60 * 60 * 1000
            );
        });
        return res.status(200).json({
            success: true,
            data: {
                total: users.length,
                newUsers: newUsers.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    statisticalUsers
};
