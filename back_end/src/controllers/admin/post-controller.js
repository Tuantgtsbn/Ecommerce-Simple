const {PostsModel: Post} = require("../../models/Posts");
const {generateUniqueSlug} = require("../../helpers/slug");

exports.createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      categories,
      publishedAt,
      status,
      visibility,
      authors,
      thumbnail,
      tags,
    } = req.body;

    const newPost = new Post({
      title,
      content,
      excerpt: excerpt || "",
      categories: categories || [],
      publishedAt: publishedAt || null,
      status: status || "draft",
      visibility: visibility || "public",
      authors:
        authors.map((author) => ({
          authorId: author?.authorId,
          authorName: author?.authorName,
        })) || [],
      thumbnail,
      tags: tags || [],
    });

    await newPost.save();

    return res.status(200).json({
      success: true,
      message: "Create post successfully",
      data: newPost,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.slug) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const currentPost = await Post.findById(postId).select("title slug").lean();

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const updates = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {$set: updates},
      {new: true},
    )
      .populate("categories.categoryId", "name slug")
      .populate("authors.authorId", "name email")
      .populate("tags.tagId", "name slug");

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Update post successfully",
      data: updatedPost,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.slug) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      visibility,
      categoryId,
    } = req.query;

    const filter = {};

    // Tìm kiếm theo từ khóa
    if (search) {
      filter.$or = [
        {title: {$regex: search, $options: "i"}},
        {content: {$regex: search, $options: "i"}},
        {excerpt: {$regex: search, $options: "i"}},
      ];
    }

    // Lọc theo status
    if (status) {
      filter.status = status;
    }

    // Lọc theo visibility
    if (visibility) {
      filter.visibility = visibility;
    }

    // Lọc theo category
    if (categoryId) {
      filter["categories.categoryId"] = categoryId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find(filter)
      .populate("categories.categoryId", "name slug")
      .populate("author.authorId", "name email")
      .populate("tags.tagId", "name slug")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("categories.categoryId", "name slug")
      .populate("author.authorId", "name email")
      .populate("tags.tagId", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.statisticalPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    const dateNow = new Date();

    // Bài viết mới trong tháng
    const newPosts = posts.filter((post) => {
      const createdDate = new Date(post.createdAt);
      const timeDiff = dateNow.getTime() - createdDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= 30; // 30 ngày gần đây
    });

    // Thống kê theo status
    const statusStats = posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo visibility
    const visibilityStats = posts.reduce((acc, post) => {
      acc[post.visibility] = (acc[post.visibility] || 0) + 1;
      return acc;
    }, {});

    // Top posts theo views và likes
    const topViewedPosts = posts
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);
    const topLikedPosts = posts
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        total: posts.length,
        newPosts: newPosts.length,
        statusStats,
        visibilityStats,
        topViewedPosts: topViewedPosts.map((p) => ({
          _id: p._id,
          title: p.title,
          totalViews: p.totalViews,
        })),
        topLikedPosts: topLikedPosts.map((p) => ({
          _id: p._id,
          title: p.title,
          totalLikes: p.totalLikes,
        })),
        publishedPosts: posts.filter((p) => p.status === "published").length,
        draftPosts: posts.filter((p) => p.status === "draft").length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
