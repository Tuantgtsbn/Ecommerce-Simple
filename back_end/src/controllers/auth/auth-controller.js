const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

//Register
const registerUser = async (req, res) => {
    const { userName, password, email } = req.body;
    try {
        const checkUser = await User.findOne({ email });
        if (checkUser)
            return res.status(400).json({
                success: false,
                message: 'Email already exists ! Please try another email.'
            });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            userName,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(200).json({
            success: true,
            message: 'Register successfully !'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

//login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return res.status(400).json({
                success: false,
                message: 'Email does not exist ! Please try another email.'
            });
        }
        const checkPassword = await bcrypt.compare(
            password,
            checkUser.password
        );
        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect ! Please try again.'
            });
        }
        // create token
        const token = jwt.sign(
            {
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
                avatar: checkUser.avatar
            },
            'CLIENT_SECRET_KEY',
            { expiresIn: '10h' }
        );
        res.cookie('token', token, {
            path: '/',
            maxAge: 10 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.json({
            success: true,
            message: 'Login successfully !',
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id,
                userName: checkUser.userName,
                avatar: checkUser.avatar,
                gender: checkUser.gender,
                birthday: checkUser.birthday
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

//logout
const logoutUser = async (req, res) => {
    res.clearCookie('token').json({
        success: true,
        message: 'Logout successfully !'
    });
};
const getInformation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({
                success: false,
                message: 'Id is required'
            });
        const user = await User.findById(id, { password: 0 });
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        res.status(200).json({
            success: true,
            message: 'Get information successfully',
            data: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
const updateProfile = async (req, res) => {
    try {
        const { id, userName, email, birthday, gender } = req.body;
        if (!id || !userName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Id, userName, email are required'
            });
        }
        const user = await User.findByIdAndUpdate(
            id,
            { userName, email, birthday: new Date(birthday), gender },
            { new: true }
        );
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        res.status(200).json({
            success: true,
            message: 'Update profile successfully',
            data: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
const changePassword = async (req, res) => {
    try {
        const { id, currentPassword, newPassword } = req.body;
        if (!id || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Id, currentPassword, newPassword are required'
            });
        }
        const user = await User.findById(id);
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        const checkPassword = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect ! Please try again.'
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Change password successfully',
            data: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//auth middleware
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        const user = await User.findById(decoded.id, { password: 0 });
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
};
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    authMiddleware,
    updateProfile,
    getInformation,
    changePassword
};
