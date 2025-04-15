const { uploadImagesProduct, deleteImages } = require('../../helpers/upLoad');
const Product = require('../../models/Product');
const { extractPublicId } = require('cloudinary-build-url');
const addProduct = async (req, res) => {
    try {
        const { name, description, price, title, category, stock, brand } =
            req.body;
        console.log('Files', req.files);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded'
            });
        }
        const { thumbnail, images } = await uploadImagesProduct(req.files);
        const newProduct = new Product({
            name,
            description,
            price,
            title,
            stock,
            category,
            thumbnail: thumbnail,
            images: images,
            brand
        });
        await newProduct.save();
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Upload file failed'
        });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedProduct = await Product.findById(id);
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const name = req.body.name || updatedProduct.name;
        const description = req.body.description || updatedProduct.description;
        const price =
            req.body.price === '' ? 0 : req.body.price || updatedProduct.price;
        const title = req.body.title || updatedProduct.title;
        const category = req.body.category || updatedProduct.category;
        const stock =
            req.body.stock === '' ? 0 : req.body.stock || updatedProduct.stock;
        const discount =
            req.body.discount === ''
                ? 0
                : req.body.discount || updatedProduct.discount;
        const brand = req.body.brand || updatedProduct.brand;
        // const thumbnail = req.body.thumbnail || updatedProduct.thumbnail;
        // const images = req.body.images || updatedProduct.images;
        updatedProduct.name = name;
        updatedProduct.description = description;
        updatedProduct.price = Number(price);
        updatedProduct.title = title;
        updatedProduct.category = category;
        updatedProduct.stock = Number(stock);
        updatedProduct.brand = brand;
        updatedProduct.discount = Number(discount);
        // updatedProduct.thumbnail = thumbnail;
        // updatedProduct.images = images;
        await updatedProduct.save();
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findById(id);
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await deletedProduct.deleteOne();
        await deleteImages([
            extractPublicId(deletedProduct.thumbnail),
            ...deletedProduct.images.map((image) => extractPublicId(image))
        ]);
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const statisticalProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const dateNow = new Date();
        const dayOfNow = dateNow.getDate();
        const newProducts = products.filter((product) => {
            return (
                dateNow.getTime() - product.createdAt.getTime() <=
                dayOfNow * 24 * 60 * 60 * 1000
            );
        });
        res.status(200).json({
            success: true,
            data: {
                total: products.length,
                newProducts: newProducts.length
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
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
    statisticalProducts
};
