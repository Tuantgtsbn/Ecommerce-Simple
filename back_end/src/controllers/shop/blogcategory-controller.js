const {
  BlogCategoryModel: BlogCategories,
} = require("../../models/BlogCategories");

const getBlogCategories = async (req, res) => {
  try {
    const {page = 1, limit = 20, search, isActive} = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {description: {$regex: search, $options: "i"}},
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const categories = await BlogCategories.find(filter)
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const totalCategories = await BlogCategories.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCategories,
        pages: Math.ceil(totalCategories / limit),
      },
    });
  } catch (error) {
    console.error("Get blog categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlogCategoryBySlug = async (req, res) => {
  try {
    const {slug} = req.params;

    const category = await BlogCategories.findOne({
      slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found or inactive",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get blog category by slug error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getActiveBlogCategories = async (req, res) => {
  try {
    const {limit = 50} = req.query;

    const categories = await BlogCategories.find({isActive: true})
      .sort({name: 1})
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: categories,
      message: "Active blog categories retrieved successfully",
    });
  } catch (error) {
    console.error("Get active blog categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlogCategoryStats = async (req, res) => {
  try {
    const {categoryId} = req.params;

    // Đếm số bài post trong category này
    const {PostModel: Post} = require("../../models/Posts");
    const postCount = await Post.countDocuments({
      categoryId,
      isActive: true,
    });

    const category = await BlogCategories.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        category,
        postCount,
      },
    });
  } catch (error) {
    console.error("Get blog category stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBlogCategories,
  getBlogCategoryBySlug,
  getActiveBlogCategories,
  getBlogCategoryStats,
};
