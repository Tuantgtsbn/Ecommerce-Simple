const Contact = require('../../models/Contact');

const getListContact = async (req, res) => {
    try {
        const { read, keyword } = req.query;

        // Xây dựng query conditions
        let conditions = {};

        // Nếu có điều kiện đọc/chưa đọc
        if (read !== undefined) {
            conditions.read = read === 'true';
        }

        // Nếu có từ khóa tìm kiếm
        if (keyword) {
            const searchRegex = new RegExp(keyword, 'i');
            conditions.$or = [
                { username: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { message: searchRegex }
            ];
        }

        // Thực hiện query với conditions
        const contacts = await Contact.find(conditions).sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

        return res.status(200).json({
            success: true,
            message: 'Contacts retrieved successfully',
            data: contacts
        });
    } catch (error) {
        console.error('Error in getListContact:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
const getDetailContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        // Bỏ đoạn tự động update read status
        return res.status(200).json({
            success: true,
            message: 'Contact retrieved successfully',
            data: contact.toObject()
        });
    } catch (error) {
        console.error('Error in getDetailContact:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { read } = req.body;
        if (!id || read === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Id and read status are required'
            });
        }
        const contact = await Contact.findByIdAndUpdate(
            id,
            { read },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        await contact.save();
        return res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: contact.toObject()
        });
    } catch (error) {
        console.error('Error in updateContact:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getListContact,
    getDetailContact,
    updateContact
};
