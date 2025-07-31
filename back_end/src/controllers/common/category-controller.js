const Category = require("../../models/Category");
// Hàm chính để build category tree
function buildCategoryTree(categories, parentId = null) {
  const result = [];

  // Lọc các category có parentCategoryId = parentId
  const childCategories = categories
    .filter((category) => category.parentCategoryId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  console.log(childCategories, "childCategories");

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
    const categories = await Category.find();
    const categoriesJson = JSON.parse(JSON.stringify(categories));
    const data = buildCategoryTree(categoriesJson);
    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
