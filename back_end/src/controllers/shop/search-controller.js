const {ProductModel: Product} = require("../../models/Product");
const {PostsModel: Post} = require("../../models/Posts");
const {CategoryModel: Category} = require("../../models/Category");
const {BrandModel: Brand} = require("../../models/ShopBrand");
const {TagModel: Tag} = require("../../models/Tag");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    const safe = escapeRegex(cleanKeyword);
    const searchRegex = {$regex: safe, $options: "i"};

    // Products: search by name, embedded category.name and brand.name
    const p1 = Product.find({
      isActive: true,
      status: "inStock",
      $or: [
        {name: searchRegex},
        {"category.name": searchRegex},
        {"brand.name": searchRegex},
      ],
    })
      .limit(Number(limit))
      .exec();

    // Tags
    const p2 = Tag.find({name: searchRegex})
      .limit(Number(limit))
      .select("name slug")
      .exec();

    // Posts: only published posts (keep as promise for parallel execution)
    const p3 = Post.find({
      status: "published",
      visibility: "public",
      $or: [
        {title: searchRegex},
        {excerpt: searchRegex},
        {content: searchRegex},
      ],
    })
      .populate("categories.categoryId", "name slug")
      .limit(Number(limit))
      .exec();

    // Categories (product categories)
    const p4 = Category.find({isActive: true, name: searchRegex})
      .limit(Number(limit))
      .select("name slug description")
      .exec();

    // Brands
    const p5 = Brand.find({isActive: true, name: searchRegex})
      .limit(Number(limit))
      .select("name slug logo description")
      .exec();

    const [products, tags, posts, categories, brands] = await Promise.all(
      [p1, p2, p3, p4, p5].map((p) => p.catch((err) => null)),
    );

    if (posts) {
      posts.forEach((post) => {
        if (Array.isArray(post.categories)) {
          post.categories = post.categories.map((cat) => cat.categoryId || cat);
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {products, posts, categories, brands, tags},
      searchQuery: cleanKeyword,
    });
  } catch (error) {
    console.error("Search all error:", error);
    res.status(500).json({success: false, message: "Search error occurred"});
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
    const safe = escapeRegex(cleanKeyword);
    const searchRegex = {$regex: `^${safe}`, $options: "i"};

    // Use distinct to get unique names, then slice to requested limit
    const productSuggestionsAll = await Product.distinct("name", {
      isActive: true,
      name: searchRegex,
    });

    const categorySuggestionsAll = await Category.distinct("name", {
      isActive: true,
      name: searchRegex,
    });

    const brandSuggestionsAll = await Brand.distinct("name", {
      isActive: true,
      name: searchRegex,
    });

    const suggestions = [
      ...productSuggestionsAll,
      ...categorySuggestionsAll,
      ...brandSuggestionsAll,
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

    // Lấy các bài post được xem nhiều nhất
    const popularPosts = await Post.find({
      status: "published",
      visibility: "public",
    })
      .sort({totalViews: -1})
      .limit(Number(limit))
      .select("title slug totalViews thumbnail createdAt");

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
  searchAll,
  getSearchSuggestions,
  getPopularSearches,
};
