const Contact = require('../../models/Contact');

const submitContact = async (req, res) => {
    try {
        const { username, email, phone, message } = req.body;
        if (!username || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const newContact = new Contact({
            username,
            email,
            phone,
            message
        });
        await newContact.save();
        return res.status(200).json({
            success: true,
            message: 'Contact submitted successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { submitContact };
