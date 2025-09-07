const {
  BlogCategoriesModel: BlogCategories,
} = require("../../models/BlogCategories");

const getBlogCategories = async (req, res) => {
  try {
    const {page = 1, limit = 20, search, isActive} = req.query;
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
    let categories;

    const query = BlogCategories.find(filter).sort({name: 1});
    if (limit === "all") {
      categories = await query.exec();
    } else {
      categories = await query.skip(skip).limit(Number(limit)).exec();
    }

    const totalCategories = await BlogCategories.countDocuments(filter);

    return res.status(200).json({
      message: "Blog categories retrieved successfully",
      success: true,
      data: categories,
      metadata: {
        page: limit === "all" ? 1 : Number(page),
        limit: limit === "all" ? "all" : Number(limit),
        totalItems: totalCategories,
        totalPages: Math.ceil(
          totalCategories / (limit === "all" ? totalCategories : Number(limit)),
        ),
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
  getBlogCategoryStats,
};
