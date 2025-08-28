const {ProductModel: Product} = require("../../models/Product");
const {PostModel: Post} = require("../../models/Posts");
const {CategoryModel: Category} = require("../../models/Category");
const {BrandModel: Brand} = require("../../models/Brand");

const searchProducts = async (req, res) => {
  try {
    const {
      keyword,
      page = 1,
      limit = 20,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sortBy = "relevance",
    } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be a string",
      });
    }

    const skip = (page - 1) * limit;
    const cleanKeyword = keyword.replace(/\+/g, " ").trim();

    // Build search query
    const searchQuery = {
      isActive: true,
      status: "inStock",
      $or: [
        {name: {$regex: cleanKeyword, $options: "i"}},
        {description: {$regex: cleanKeyword, $options: "i"}},
        {tags: {$regex: cleanKeyword, $options: "i"}},
      ],
    };

    // Add filters
    if (categoryId) {
      searchQuery.categoryId = categoryId;
    }

    if (brandId) {
      searchQuery.brandId = brandId;
    }

    if (minPrice || maxPrice) {
      searchQuery.basePrice = {};
      if (minPrice) searchQuery.basePrice.$gte = Number(minPrice);
      if (maxPrice) searchQuery.basePrice.$lte = Number(maxPrice);
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case "price_low":
        sortOptions = {basePrice: 1};
        break;
      case "price_high":
        sortOptions = {basePrice: -1};
        break;
      case "rating":
        sortOptions = {averageRating: -1};
        break;
      case "newest":
        sortOptions = {createdAt: -1};
        break;
      case "popular":
        sortOptions = {totalReviews: -1, totalViews: -1};
        break;
      default: // relevance
        sortOptions = {totalViews: -1};
    }

    const totalProducts = await Product.countDocuments(searchQuery);

    const searchResults = await Product.find(searchQuery)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug logo")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: searchResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit),
      },
      searchQuery: cleanKeyword,
      filters: {
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        sortBy,
      },
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Search error occurred",
    });
  }
};

const searchAll = async (req, res) => {
  try {
    const {keyword, limit = 5} = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be a string",
      });
    }

    const cleanKeyword = keyword.replace(/\+/g, " ").trim();
    const searchRegex = {$regex: cleanKeyword, $options: "i"};

    // Search products
    const products = await Product.find({
      isActive: true,
      status: "inStock",
      $or: [
        {name: searchRegex},
        {description: searchRegex},
        {tags: searchRegex},
      ],
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .limit(Number(limit))
      .select("name slug images basePrice discountPrice averageRating");

    // Search posts
    const posts = await Post.find({
      isActive: true,
      $or: [
        {title: searchRegex},
        {excerpt: searchRegex},
        {content: searchRegex},
      ],
    })
      .populate("categoryId", "name slug")
      .populate("authorId", "username avatar")
      .limit(Number(limit))
      .select("title slug excerpt thumbnail createdAt");

    // Search categories
    const categories = await Category.find({
      isActive: true,
      name: searchRegex,
    })
      .limit(Number(limit))
      .select("name slug description");

    // Search brands
    const brands = await Brand.find({
      isActive: true,
      name: searchRegex,
    })
      .limit(Number(limit))
      .select("name slug logo description");

    res.status(200).json({
      success: true,
      data: {
        products,
        posts,
        categories,
        brands,
      },
      searchQuery: cleanKeyword,
      totalResults:
        products.length + posts.length + categories.length + brands.length,
    });
  } catch (error) {
    console.error("Search all error:", error);
    res.status(500).json({
      success: false,
      message: "Search error occurred",
    });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const {keyword, limit = 10} = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    const cleanKeyword = keyword.replace(/\+/g, " ").trim();
    const searchRegex = {$regex: `^${cleanKeyword}`, $options: "i"};

    // Get product name suggestions
    const productSuggestions = await Product.find({
      isActive: true,
      name: searchRegex,
    })
      .limit(Number(limit))
      .select("name")
      .distinct("name");

    // Get category suggestions
    const categorySuggestions = await Category.find({
      isActive: true,
      name: searchRegex,
    })
      .limit(5)
      .select("name")
      .distinct("name");

    // Get brand suggestions
    const brandSuggestions = await Brand.find({
      isActive: true,
      name: searchRegex,
    })
      .limit(5)
      .select("name")
      .distinct("name");

    const suggestions = [
      ...productSuggestions,
      ...categorySuggestions,
      ...brandSuggestions,
    ].slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: suggestions,
      searchQuery: cleanKeyword,
    });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting suggestions",
    });
  }
};

const getPopularSearches = async (req, res) => {
  try {
    const {limit = 10} = req.query;

    // Lấy sản phẩm được xem nhiều nhất
    const popularProducts = await Product.find({
      isActive: true,
      status: "inStock",
    })
      .sort({totalViews: -1})
      .limit(Number(limit))
      .select("name slug totalViews");

    // Lấy category phổ biến
    const popularCategories = await Category.find({
      isActive: true,
    })
      .sort({productCount: -1})
      .limit(5)
      .select("name slug");

    res.status(200).json({
      success: true,
      data: {
        products: popularProducts,
        categories: popularCategories,
      },
    });
  } catch (error) {
    console.error("Get popular searches error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting popular searches",
    });
  }
};

module.exports = {
  searchProducts,
  searchAll,
  getSearchSuggestions,
  getPopularSearches,
};
