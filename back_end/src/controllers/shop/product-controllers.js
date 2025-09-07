const {
  ProductModel: Product,
  ProductVariantModel,
} = require("../../models/Product");
const {cleanObject} = require("../../helpers/filter");

const fetchFilteredProducts = async (req, res) => {
  1;
  try {
    const filterParams = cleanObject(req.query, [
      "categories",
      "brands",
      "price",
      "sortBy",
      "search",
      "page",
      "limit",
      "colors",
    ]);

    let filter = {status: "inStock", isActive: true};
    const limit = filterParams.limit ? Number(filterParams.limit) || 12 : 12;
    const page = filterParams.page ? Number(filterParams.page) || 1 : 1;

    // Lọc theo category (slug)
    if (filterParams.categories) {
      const categories = filterParams.categories.split(",");
      filter.category.slug = {$in: categories};
    }

    // Lọc theo brand (slug)
    if (filterParams.brands) {
      const brands = filterParams.brands.split(",");
      filter.brand.slug = {$in: brands};
    }

    // Lọc theo khoảng giá
    if (filterParams.price) {
      const priceRange = filterParams.price;
      if (priceRange.includes("-")) {
        const [minPrice, maxPrice] = priceRange.split("-");
        filter.basePrice = {$gte: Number(minPrice), $lte: Number(maxPrice)};
      }
    }

    // Lọc theo màu sắc
    if (filterParams.colors) {
      const colors = filterParams.colors.split(",");
      filter["attributes.value"] = {$in: colors};
    }

    // Tìm kiếm theo từ khóa
    if (filterParams.search) {
      const search = filterParams.search;
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {"category.name": {$regex: search, $options: "i"}},
        {"brand.name": {$regex: search, $options: "i"}},
      ];
    }

    let sort = {};
    switch (filterParams.sortBy) {
      case "price-lowtohigh":
        sort.basePrice = 1;
        break;
      case "price-hightolow":
        sort.basePrice = -1;
        break;
      case "name-atoz":
        sort.name = 1;
        break;
      case "name-ztoa":
        sort.name = -1;
        break;
      case "newest":
        sort.createdAt = -1;
        break;
      case "oldest":
        sort.createdAt = 1;
        break;
      case "rating":
        sort.averageRating = -1;
        break;
      case "popular":
        sort.totalViews = -1;
        break;
      default:
        sort.basePrice = 1;
        break;
    }

    const p1 = Product.countDocuments(filter);
    const p2 = Product.find(filter)
      .populate("tags", "name slug")
      .sort(sort)
      .limit(limit)
      .skip(limit * (page - 1));

    const [totalProducts, products] = await Promise.all([p1, p2]);
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      data: products,
      metadata: {
        page,
        limit,
        totalPages,
        totalItems: totalProducts,
      },
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getProductDetail = async (req, res) => {
  try {
    const {id, slug} = req.query;
    const filter = id ? {_id: id, isActive: true} : {slug, isActive: true};

    const productPromise = Product.findOne(filter)
      .populate("categoryId", "_id name slug description")
      .populate("brandId", "_id name slug logo description")
      .populate("tags", "_id name slug")
      .exec();

    const productVariantsPromise = ProductVariantModel.find({
      productId: id,
    }).exec();

    const [product, variants] = await Promise.all([
      productPromise,
      productVariantsPromise,
    ]);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Tăng view count (optional)
    product.totalViews = product.totalViews + 1;
    Promise.allSettled([product.save()]);

    return res.status(200).json({
      success: true,
      data: {...product.toObject(), variants},
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const findRelatedProducts = async (req, res) => {
  try {
    const {id} = req.params;
    const {limit = 8} = req.query;
    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Tìm sản phẩm liên quan theo category và brand
    const filter = {
      $or: [
        {categoryId: currentProduct.categoryId},
        {brandId: currentProduct.brandId},
        {tags: {$in: currentProduct.tags}},
      ],
      _id: {$ne: currentProduct._id},
      isActive: true,
      status: "inStock",
    };

    const relatedProducts = await Product.find(filter)
      .limit(Number(limit))
      .skip(Number(limit) * (Number(page) - 1));

    return res.status(200).json({
      success: true,
      data: relatedProducts,
      metadata: {
        page: 1,
        limit: Number(limit),
        totalItems: relatedProducts.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  fetchFilteredProducts,
  getProductDetail,
  findRelatedProducts,
};
