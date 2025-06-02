const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BlogCategoriesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        default: ''
    },
    image_url: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const BlogCategoriesModel = mongoose.model(
    'BlogCategories',
    BlogCategoriesSchema
);
module.exports = BlogCategoriesModel;
