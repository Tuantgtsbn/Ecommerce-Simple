const {CategoryModel: Category} = require("../../models/Category");

// Hàm chính để build category tree
function buildCategoryTree(categories, parentId = null) {
  const result = [];

  // Lọc các category có parentCategoryId = parentId
  const childCategories = categories
    .filter((category) => {
      if (parentId === null) {
        return (
          category.parentCategoryId === null ||
          category.parentCategoryId === undefined
        );
      }
      return (
        category.parentCategoryId &&
        category.parentCategoryId.toString() === parentId.toString()
      );
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const category of childCategories) {
    // Tạo object category với children
    const categoryWithChildren = {
      ...category,
      children: buildCategoryTree(categories, category._id),
    };

    result.push(categoryWithChildren);
  }

  return result;
}

exports.getCategories = async (req, res) => {
  try {
    const {includeInactive = false, parentId} = req.query;

    // Build filter
    const filter = {};
    if (!includeInactive || includeInactive === "false") {
      filter.isActive = true;
    }

    // Nếu có parentId, chỉ lấy categories con
    if (parentId) {
      filter.parentCategoryId = parentId;
    }

    const categories = await Category.find(filter)
      .populate("parentCategoryId", "name slug")
      .sort({sortOrder: 1, name: 1});

    const categoriesJson = JSON.parse(JSON.stringify(categories));

    let data;
    if (parentId) {
      // Nếu có parentId, trả về flat list
      data = categoriesJson;
    } else {
      // Nếu không có parentId, build tree
      data = buildCategoryTree(categoriesJson);
    }

    return res.status(200).json({
      success: true,
      data: data,
      total: categories.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const {id} = req.params;

    const category = await Category.findById(id).populate(
      "parentCategoryId",
      "name slug",
    );

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

exports.getCategoryBySlug = async (req, res) => {
  try {
    const {slug} = req.params;

    const category = await Category.findOne({slug, isActive: true}).populate(
      "parentCategoryId",
      "name slug",
    );

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

exports.getSubcategories = async (req, res) => {
  try {
    const {parentId} = req.params;

    const subcategories = await Category.find({
      parentCategoryId: parentId,
      isActive: true,
    }).sort({sortOrder: 1, name: 1});

    return res.status(200).json({
      success: true,
      data: subcategories,
      total: subcategories.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
