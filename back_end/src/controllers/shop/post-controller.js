const {PostsModel: Post} = require("../../models/Posts");
const BlogCategories = require("../../models/BlogCategories");
const User = require("../../models/User");
const {default: mongoose} = require("mongoose");

const getPosts = async (req, res) => {
  try {
    const {page = 1, limit = 20, category_id = ""} = req.body;
    let sortBy = req.body.sortBy || "created_at";
    if (sortBy === "most-view") {
      sortBy = "view_count";
    } else if (sortBy === "most-like") {
      sortBy = "like_count";
    }
    const filter = category_id ? {categories: {$elemMatch: {category_id}}} : {};
    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);
    const posts = await Post.find(filter)
      .populate({
        path: "categories.category_id",
        select: "name",
      })
      .populate({
        path: "author.author_id",
        select: "userName avatar",
      })
      .select({
        content: 0,
      })
      .sort({[sortBy]: -1})
      .skip(limit * (page - 1))
      .limit(limit);
    return res.status(200).json({
      success: true,
      data: posts,
      totalPages,
      currentPage: +page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailPostById = async (req, res) => {
  try {
    const {id} = req.params;
    const post = await Post.findById(id)
      .populate({
        path: "categories.category_id",
        select: "name",
      })
      .populate({
        path: "author.author_id",
        select: "userName avatar",
      });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailPostBySlug = async (req, res) => {
  try {
    const {id} = req.params;
    const post = await Post.findOne({slug: id})
      .populate({
        path: "categories.category_id",
        select: "name",
      })
      .populate({
        path: "author.author_id",
        select: "userName avatar",
      });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
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
      return getDetailPostBySlug(req, res);
    } else {
      return getDetailPostById(req, res);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchPosts = async (req, res) => {
  try {
    const {keyword, page = 1, limit = 10} = req.query;
    console.log(keyword, "keyword");
    console.log(page, "page");
    let parseKeyword = keyword.split("+").join(" ");

    if (!parseKeyword || typeof parseKeyword !== "string") {
      return res.status(400).json({
        succes: false,
        message: "Keyword is required and must be in string format",
      });
    }
    const regEx = new RegExp(parseKeyword, "i");
    const createSearchQuery = {
      $or: [{title: regEx}, {content: regEx}],
    };
    const totalPosts = await Post.countDocuments(createSearchQuery);
    const totalPages = Math.ceil(totalPosts / limit);
    const searchResults = await Post.find(createSearchQuery)
      .populate({
        path: "categories.category_id",
        select: "name",
      })
      .populate({
        path: "author.author_id",
        select: "userName avatar",
      })
      .select({
        content: 0,
      })
      .sort({created_at: -1})
      .skip(limit * (page - 1))
      .limit(limit);
    res.status(200).json({
      success: true,
      data: searchResults,
      totalPages,
      currentPage: +page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};
module.exports = {
  getPosts,
  getDetailPost,
  searchPosts,
};
