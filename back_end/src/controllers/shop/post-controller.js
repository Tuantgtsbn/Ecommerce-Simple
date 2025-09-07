const {PostsModel: Post} = require("../../models/Posts");
const {
  BlogCategoriesModel: BlogCategories,
} = require("../../models/BlogCategories");
const {default: mongoose} = require("mongoose");

const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      categoryIds,
      sortBy = "createdAt",
      search,
      authorId,
      tags,
    } = req.query;

    // Build filter object
    const filter = {status: "published", visibility: "public"};

    if (typeof categoryIds === "string" && categoryIds.trim() !== "") {
      const categoryIdArray = categoryIds.split(",").map((id) => id.trim());
      filter.categoryId = {$in: categoryIdArray};
    } else if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      filter.categoryId = {$in: categoryIds};
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

    const query = Post.find(filter)
      .populate("categoryId", "name slug")
      .populate("authorId", "username avatar")
      .select("-content") // Exclude content for list view
      .sort(sortOptions);

    if (limit && Number(limit) > 0) {
      query.limit(Number(limit)).skip((page - 1) * limit);
    }
    const posts = await query.exec();

    return res.status(200).json({
      success: true,
      data: posts,
      metadata: {
        page: Number(page),
        limit: Number(limit) || "all",
        totalItems: totalPosts,
        totalPages: Math.ceil(totalPosts / (Number(limit) || totalPosts)),
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

const getDetailPost = async (req, res) => {
  try {
    const {id, slug} = req.params;
    const filter = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter._id = id;
    } else if (slug) {
      filter.slug = slug;
    }
    const post = await Post.findOne(filter).populate(
      "categories.categoryId",
      "name slug description",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.totalViews += 1;
    await post.save();
    const {categories} = post;
    if (categories && categories.length > 0) {
      post.categories = categories.map((cat) => cat.categoryId);
    } else {
      post.categories = null;
    }
    return res.status(200).json({
      success: true,
      data: post.toObject(),
    });
  } catch (error) {
    console.error("Get post by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
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
    // Extract categoryIds and tagIds from currentPost according to Posts schema
    const categoryIds = (currentPost.categories || [])
      .map((c) => c && c.categoryId)
      .filter(Boolean);
    const tagIds = (currentPost.tags || [])
      .map((t) => t && t.tagId)
      .filter(Boolean);

    // If no categories/tags, return empty list
    if (categoryIds.length === 0 && tagIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        matadata: {
          page: 1,
          limit: Number(limit),
          totalItems: 0,
          totalPages: 0,
        },
      });
    }

    const orClauses = [];
    if (categoryIds.length)
      orClauses.push({"categories.categoryId": {$in: categoryIds}});
    if (tagIds.length) orClauses.push({"tags.tagId": {$in: tagIds}});

    const totalRelatedPosts = await Post.countDocuments({
      _id: {$ne: postId},
      status: "published",
      visibility: "public",
      $or: orClauses,
    });

    const relatedPosts = await Post.find({
      _id: {$ne: postId},
      status: "published",
      visibility: "public",
      $or: orClauses,
    })
      .populate("categories.categoryId", "name slug")
      .populate("authors.authorId", "username avatar")
      .select("-content")
      .sort({createdAt: -1})
      .limit(Number(limit));
    for (const post of relatedPosts) {
      post.categories = post.categories.map((cat) => cat.categoryId);
      post.tags = post.tags.map((tag) => tag.tagId);
    }
    return res.status(200).json({
      success: true,
      data: relatedPosts,
      matadata: {
        page: 1,
        limit: Number(limit),
        totalItems: relatedPosts.length,
        totalPages: Math.ceil(totalRelatedPosts / Number(limit)),
      },
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
    const {limit = 5, categoryIds, page = 1} = req.query;

    const filter = {
      status: "published",
      visibility: "public",
    };

    if (typeof categoryIds === "string" && categoryIds.trim() !== "") {
      filter["categories.categoryId"] = {
        $in: categoryIds.split(",").map((id) => id.trim()),
      };
    } else if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      filter["categories.categoryId"] = {$in: categoryIds};
    }

    const totalItems = await Post.countDocuments(filter);

    const featuredPosts = await Post.find(filter)
      .populate("categories.categoryId", "name slug")
      .populate("authors.authorId", "username avatar")
      .select("-content")
      .sort({totalViews: -1})
      .limit(Number(limit));

    // Normalize categories/tags to arrays of ids
    const normalized = featuredPosts.map((post) => {
      const p = post.toObject();
      if (p.categories && p.categories.length) {
        p.categories = p.categories.map((c) => c.categoryId);
      } else {
        p.categories = null;
      }
      if (p.tags && p.tags.length) {
        p.tags = p.tags.map((t) => t.tagId);
      } else {
        p.tags = null;
      }
      return p;
    });

    return res.status(200).json({
      success: true,
      data: normalized,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit || totalItems)),
      },
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
  getRelatedPosts,
  getFeaturedPosts,
};
