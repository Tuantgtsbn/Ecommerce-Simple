const formatMongooseError = require("../../helpers/formatError");
const BannerHero = require("../../models/Hero");

const getAllBanners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.active !== undefined) {
      filter.active = req.query.active === "true";
    }
    if (req.query.search) {
      filter.$or = [
        {
          title: {$regex: req.query.search, $options: "i"},
        },
        {
          subtitle: {$regex: req.query.search, $options: "i"},
        },
        {
          description: {$regex: req.query.search, $options: "i"},
        },
      ];
    }
    const banners = await BannerHero.find(filter)
      .sort({order: 1, createdAt: -1})
      .skip(skip)
      .limit(limit);
    const total = await BannerHero.countDocuments(filter);
    res.status(200).json({
      success: true,
      data: banners,
      metadata: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
      message: "Banners retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getBannerById = async (req, res) => {
  try {
    const {id} = req.params;
    const banner = await BannerHero.findById(id)
      .populate("createdBy", "username email")
      .populate("updatedBy", "username email");
    if (!banner) {
      return res
        .status(404)
        .json({success: false, message: "Banner not found"});
    }
    res.status(200).json({
      success: true,
      data: banner,
      message: "Banner retrieved successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({success: false, message: "Server error", error: error.message});
  }
};

const createBanner = async (req, res) => {
  try {
    const {title, images} = req.body;
    if (
      !title ||
      !images ||
      !images.destop ||
      !images.tablet ||
      !images.mobile
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and all device images are required",
      });
    }
    const newBanner = new BannerHero({
      ...req.body,
      createBy: req.user?._id,
    });
    const savedBanner = await newBanner.save();
    await savedBanner.populate("createdBy", "username email");
    res.status(201).json({
      success: true,
      data: savedBanner,
      message: "Banner created successfully",
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    res
      .status(500)
      .json({success: false, message: "Server error", error: formattedError});
  }
};

const updateBanner = async (req, res) => {
  try {
    const {id} = req.params;
    const updateData = {
      ...req.body,
      updateBy: req.user?._id,
    };
    const updatedBanner = await BannerHero.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate("createdBy", "username email")
      .populate("updatedBy", "username email");
    if (!updatedBanner) {
      return res
        .status(404)
        .json({success: false, message: "Banner not found"});
    }
    res.status(200).json({
      success: true,
      data: updatedBanner,
      message: "Banner updated successfully",
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    res
      .status(500)
      .json({success: false, message: "Server error", error: formattedError});
  }
};

const deleteBanner = async (req, res) => {
  try {
    const {id} = req.params;
    const deletedBanner = await BannerHero.findByIdAndDelete(id);
    if (!deletedBanner) {
      return res
        .status(404)
        .json({success: false, message: "Banner not found"});
    }
    res.status(200).json({
      success: true,
      data: deletedBanner,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({success: false, message: "Server error", error: error.message});
  }
};

const toggleBannerStatus = async (req, res) => {
  try {
    const {id} = req.params;
    const banner = await BannerHero.findById(id);
    if (!banner) {
      return res
        .status(404)
        .json({success: false, message: "Banner not found"});
    }
    banner.isActive = !banner.isActive;
    banner.updateBy = req.user?._id;
    await banner.save();
    res.status(200).json({
      success: true,
      data: banner,
      message: "Banner status updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({success: false, message: "Server error", error: error.message});
  }
};

const reorderBanners = async (req, res) => {
  try {
    const {bannerOrders} = req.body;
    if (!Array.isArray(bannerOrders) || bannerOrders.length === 0) {
      return res
        .status(400)
        .json({success: false, message: "Invalid banner order data"});
    }
    const updatePromises = bannerOrders.map(async ({id, order}) => {
      const banner = await BannerHero.findById(id);
      if (banner) {
        banner.order = order;
        banner.updateBy = req.user?._id;
        return banner.save();
      }
      throw new Error(`Banner with id ${id} not found`);
    });
    const updatedBanners = await Promise.all(updatePromises);
    res.status(200).json({
      success: true,
      data: updatedBanners,
      message: "Banners reordered successfully",
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    res
      .status(500)
      .json({success: false, message: "Server error", error: formattedError});
  }
};

const validateBannerData = async (req, res) => {
  try {
    const testBanner = new BannerHero(req.body);
    await testBanner.validate();
    res.status(200).json({
      success: true,
      message: "Data is valid",
      data: {
        isValid: true,
        validatedData: testBanner.toObject(),
      },
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    res.status(500).json({
      success: false,
      message: "Data is invalid",
      error: formattedError,
    });
  }
};

module.exports = {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
  validateBannerData,
};
