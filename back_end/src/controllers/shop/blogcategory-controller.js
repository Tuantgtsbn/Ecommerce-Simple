const BlogCategories = require("../../models/BlogCategories");

const getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategories.find();
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getBlogCategoryBySlug = async (req, res) => {
  try {
    const {slug} = req.params;
    const category = await BlogCategories.findOne({slug});
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBlogCategories,
  getBlogCategoryBySlug,
};
