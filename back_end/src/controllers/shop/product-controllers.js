const {ProductModel: Product} = require("../../models/Product");

const fetchFilteredProducts = async (req, res) => {
  try {
    const {
      categoryId = [],
      brandId = [],
      category = [],
      brand = [],
      sortBy = "price-lowtohigh",
      limit = 12,
      page = 1,
      search,
      minPrice,
      maxPrice,
      tags,
      status = "inStock",
    } = req.query;

    let filter = {isActive: true, status: status};

    // Lọc theo category (cả ID và name)
    if (categoryId.length > 0) {
      filter.categoryId = {$in: categoryId.split(",")};
    } else if (category.length > 0) {
      filter["category.name"] = {$in: category.split(",")};
    }

    // Lọc theo brand (cả ID và name)
    if (brandId.length > 0) {
      filter.brandId = {$in: brandId.split(",")};
    } else if (brand.length > 0) {
      filter["brand.name"] = {$in: brand.split(",")};
    }

    // Tìm kiếm theo từ khóa
    if (search) {
      filter.$or = [
        {name: {$regex: search, $options: "i"}},
        {title: {$regex: search, $options: "i"}},
        {description: {$regex: search, $options: "i"}},
        {"category.name": {$regex: search, $options: "i"}},
        {"brand.name": {$regex: search, $options: "i"}},
      ];
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    // Lọc theo tags
    if (tags && tags.length > 0) {
      filter.tags = {$in: tags.split(",")};
    }

    let sort = {};
    switch (sortBy) {
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
        sort.totalReviews = -1;
        break;
      default:
        sort.basePrice = 1;
        break;
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const filteredProducts = await Product.find(filter)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .populate("tags", "name slug")
      .sort(sort)
      .limit(Number(limit))
      .skip(Number(limit) * (Number(page) - 1));

    return res.status(200).json({
      success: true,
      data: filteredProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: Number(page),
        itemsPerPage: Number(limit),
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
    const {id} = req.params;

    const product = await Product.findById(id)
      .populate("categoryId", "name slug description")
      .populate("brandId", "name slug logo description")
      .populate("tags", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product is not available",
      });
    }

    // Tăng view count (optional)
    await Product.findByIdAndUpdate(id, {
      $inc: {totalViews: 1},
    });

    return res.status(200).json({
      success: true,
      data: product.toObject(),
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
    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Tìm sản phẩm liên quan theo category và brand
    const relatedProducts = await Product.find({
      $or: [
        {categoryId: currentProduct.categoryId},
        {brandId: currentProduct.brandId},
        {tags: {$in: currentProduct.tags}},
      ],
      _id: {$ne: currentProduct._id},
      isActive: true,
      status: "inStock",
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort({averageRating: -1, totalReviews: -1})
      .limit(8);

    return res.status(200).json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const {slug} = req.params;

    const product = await Product.findOne({slug, isActive: true})
      .populate("categoryId", "name slug description")
      .populate("brandId", "name slug logo description")
      .populate("tags", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Tăng view count
    await Product.findByIdAndUpdate(product._id, {
      $inc: {totalViews: 1},
    });

    return res.status(200).json({
      success: true,
      data: product.toObject(),
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const {limit = 8} = req.query;

    const featuredProducts = await Product.find({
      isActive: true,
      status: "inStock",
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort({averageRating: -1, totalReviews: -1, totalLikes: -1})
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNewProducts = async (req, res) => {
  try {
    const {limit = 8} = req.query;

    const newProducts = await Product.find({
      isActive: true,
      status: "inStock",
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort({createdAt: -1})
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: newProducts,
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
  getProductBySlug,
  getFeaturedProducts,
  getNewProducts,
};
