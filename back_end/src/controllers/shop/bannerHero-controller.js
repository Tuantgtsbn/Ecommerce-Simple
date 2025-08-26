const BannerHero = require("../../models/Hero");

const getActiveBanners = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const banners = await BannerHero.getActiveBanners(limit);
    res.status(200).json({
      success: true,
      data: banners,
      message: "Active banners retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getActiveBanners,
};
