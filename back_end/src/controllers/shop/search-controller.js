const Product = require('../../models/Product');

const searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({
                succes: false,
                message: 'Keyword is required and must be in string format'
            });
        }
        let parseKeyword = keyword.split('+').join(' ');
        const regEx = new RegExp(parseKeyword, 'i');

        const createSearchQuery = {
            $or: [
                { title: regEx },
                { name: regEx },
                { description: regEx },
                { category: regEx },
                { brand: regEx },
                { tags: regEx }
            ]
        };

        const searchResults = await Product.find(createSearchQuery);

        res.status(200).json({
            success: true,
            data: searchResults
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error'
        });
    }
};

module.exports = { searchProducts };
