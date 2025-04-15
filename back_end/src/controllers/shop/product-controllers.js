const Product = require('../../models/Product');
const fetchFilteredProducts = async (req, res) => {
    try {
        const {
            category = [],
            brand = [],
            sortBy = 'price-lowtohigh',
            limit = 12,
            page = 1
        } = req.query;
        let filter = {};
        if (category.length > 0) {
            filter.category = { $in: category.split(',') };
        }
        if (brand.length > 0) {
            filter.brand = { $in: brand.split(',') };
        }
        let sort = {};
        switch (sortBy) {
            case 'price-lowtohigh':
                sort.price = 1;
                break;
            case 'price-hightolow':
                sort.price = -1;
                break;
            case 'title-atoz':
                sort.title = 1;
                break;
            case 'title-ztoa':
                sort.title = -1;
                break;
            default:
                sort.price = 1;
                break;
        }
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        const filteredProducts = await Product.find(filter)
            .sort(sort)
            .limit(limit)
            .skip(limit * (page - 1));

        return res.status(200).json({
            success: true,
            data: filteredProducts,
            totalPages,
            currentPage: +page
        });
    } catch (error) {
        console.log('error', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: product.toObject()
        });
    } catch (error) {
        console.log('error', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const findRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const currentProduct = await Product.findById(id);

        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const relatedProducts = await Product.find({
            category: currentProduct.category,
            _id: { $ne: currentProduct._id } // Exclude current product
        }).limit(5);

        return res.status(200).json({
            success: true,
            data: relatedProducts
        });
    } catch (error) {
        console.log('error', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    fetchFilteredProducts,
    getProductDetail,
    findRelatedProducts
};
