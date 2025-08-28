const {PostModel: Post} = require("../../models/Posts");
const {
  BlogCategoryModel: BlogCategories,
} = require("../../models/BlogCategories");
const {UserModel: User} = require("../../models/User");
const {default: mongoose} = require("mongoose");

const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      sortBy = "createdAt",
      search,
      authorId,
      tags,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {isActive: true};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (authorId) {
      filter.authorId = authorId;
    }

    if (search) {
      filter.$or = [
        {title: {$regex: search, $options: "i"}},
        {excerpt: {$regex: search, $options: "i"}},
        {content: {$regex: search, $options: "i"}},
      ];
    }

    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = {$in: tagArray};
    }

    // Build sort object
    let sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions = {createdAt: -1};
        break;
      case "oldest":
        sortOptions = {createdAt: 1};
        break;
      case "most-view":
        sortOptions = {totalViews: -1};
        break;
      case "most-like":
        sortOptions = {totalLikes: -1};
        break;
      case "title":
        sortOptions = {title: 1};
        break;
      default:
        sortOptions = {createdAt: -1};
    }

    const totalPosts = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate("categoryId", "name slug")
      .populate("authorId", "username avatar")
      .select("-content") // Exclude content for list view
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailPostById = async (req, res) => {
  try {
    const {id} = req.params;

    const post = await Post.findOne({_id: id, isActive: true})
      .populate("categoryId", "name slug description")
      .populate("authorId", "username avatar bio")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increase view count
    await Post.findByIdAndUpdate(id, {
      $inc: {totalViews: 1},
    });

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get post by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailPostBySlug = async (req, res) => {
  try {
    const {slug} = req.params;

    const post = await Post.findOne({slug, isActive: true})
      .populate("categoryId", "name slug description")
      .populate("authorId", "username avatar bio")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increase view count
    await Post.findByIdAndUpdate(post._id, {
      $inc: {totalViews: 1},
    });

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get post by slug error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailPost = async (req, res) => {
  try {
    const {id} = req.params;
    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (!isValidId) {
      // Treat as slug
      req.params.slug = id;
      return getDetailPostBySlug(req, res);
    } else {
      return getDetailPostById(req, res);
    }
  } catch (error) {
    console.error("Get detail post error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchPosts = async (req, res) => {
  try {
    const {keyword, page = 1, limit = 10, categoryId} = req.query;

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
      $or: [
        {title: {$regex: cleanKeyword, $options: "i"}},
        {excerpt: {$regex: cleanKeyword, $options: "i"}},
        {content: {$regex: cleanKeyword, $options: "i"}},
        {tags: {$regex: cleanKeyword, $options: "i"}},
      ],
    };

    if (categoryId) {
      searchQuery.categoryId = categoryId;
    }

    const totalPosts = await Post.countDocuments(searchQuery);

    const searchResults = await Post.find(searchQuery)
      .populate("categoryId", "name slug")
      .populate("authorId", "username avatar")
      .select("-content") // Exclude content for search results
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: searchResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      },
      searchQuery: cleanKeyword,
    });
  } catch (error) {
    console.error("Search posts error:", error);
    res.status(500).json({
      success: false,
      message: "Search error occurred",
    });
  }
};

const getRelatedPosts = async (req, res) => {
  try {
    const {postId} = req.params;
    const {limit = 5} = req.query;

    const currentPost = await Post.findById(postId);
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find related posts based on category and tags
    const relatedPosts = await Post.find({
      _id: {$ne: postId},
      isActive: true,
      $or: [
        {categoryId: currentPost.categoryId},
        {tags: {$in: currentPost.tags}},
      ],
    })
      .populate("categoryId", "name slug")
      .populate("authorId", "username avatar")
      .select("-content")
      .sort({createdAt: -1})
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: relatedPosts,
    });
  } catch (error) {
    console.error("Get related posts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFeaturedPosts = async (req, res) => {
  try {
    const {limit = 5} = req.query;

    const featuredPosts = await Post.find({
      isActive: true,
      isFeatured: true,
    })
      .populate("categoryId", "name slug")
      .populate("authorId", "username avatar")
      .select("-content")
      .sort({createdAt: -1})
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: featuredPosts,
    });
  } catch (error) {
    console.error("Get featured posts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getPosts,
  getDetailPost,
  searchPosts,
  getRelatedPosts,
  getFeaturedPosts,
};
