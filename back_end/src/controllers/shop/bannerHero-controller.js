const {BannerHeroModel: BannerHero} = require("../../models/Hero");

const getActiveBanners = async (req, res) => {
  try {
    const {limit = 10, page = 1} = req.query;
    const skip = (page - 1) * limit;

    const banners = await BannerHero.find({
      isActive: true,
      startDate: {$lte: new Date()},
      $or: [{endDate: null}, {endDate: {$gte: new Date()}}],
    })
      .sort({priority: -1, createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const totalBanners = await BannerHero.countDocuments({
      isActive: true,
      startDate: {$lte: new Date()},
      $or: [{endDate: null}, {endDate: {$gte: new Date()}}],
    });

    res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalBanners,
        pages: Math.ceil(totalBanners / limit),
      },
      message: "Active banners retrieved successfully",
    });
  } catch (error) {
    console.error("Get active banners error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getBannerBySlug = async (req, res) => {
  try {
    const {slug} = req.params;

    const banner = await BannerHero.findOne({
      slug,
      isActive: true,
      startDate: {$lte: new Date()},
      $or: [{endDate: null}, {endDate: {$gte: new Date()}}],
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found or not active",
      });
    }

    res.status(200).json({
      success: true,
      data: banner,
      message: "Banner retrieved successfully",
    });
  } catch (error) {
    console.error("Get banner by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getFeaturedBanners = async (req, res) => {
  try {
    const {limit = 5} = req.query;

    const banners = await BannerHero.find({
      isActive: true,
      isFeatured: true,
      startDate: {$lte: new Date()},
      $or: [{endDate: null}, {endDate: {$gte: new Date()}}],
    })
      .sort({priority: -1, createdAt: -1})
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: banners,
      message: "Featured banners retrieved successfully",
    });
  } catch (error) {
    console.error("Get featured banners error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getActiveBanners,
  getBannerBySlug,
  getFeaturedBanners,
};
