const jwt = require('jsonwebtoken');

const checkRoleAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Some thing wrong!'
        });
    }
};
const checkRoleClient = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        if (decoded.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Some thing wrong!'
        });
    }
};
const checkRoleUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Some thing wrong!'
        });
    }
};

module.exports = { checkRoleAdmin, checkRoleUser, checkRoleClient };
