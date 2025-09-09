const {cleanObject} = require("../../helpers/filter");
const {ShopModel, BrandModel} = require("../../models/ShopBrand");

const getShopInfo = async (req, res) => {
  try {
    const shop = await ShopModel.findOne({});
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getDetailBrand = async (req, res) => {
  try {
    const {id} = req.params;
    const brand = await BrandModel.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFilterBrands = async (req, res) => {
  try {
    const {sortBy, order, page, limit, isActive, search} = cleanObject(
      req.query,
    );
    const filter = {};
    if (isActive) filter.isActive = isActive === "true";
    if (search) filter.name = {$regex: search, $options: "i"};
    const sortOption = {};
    if (typeof sortBy === "string" && ["name", "createdAt"].includes(sortBy)) {
      sortOption[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sortOption["name"] = 1;
    }
    const pageNumber = page ? (parseInt(page) ?? 1) : 1;
    const limitNumber = limit ? (parseInt(limit) ?? "all") : "all";
    const query = BrandModel.find(filter).sort(sortOption);
    if (limitNumber !== "all") {
      query.skip((pageNumber - 1) * limitNumber).limit(limitNumber);
    } else {
      query.skip((pageNumber - 1) * 10);
    }

    const totalBrands = await BrandModel.countDocuments(filter);
    const brands = await query.exec();
    return res.status(200).json({
      success: true,
      data: brands,
      metadata: {
        page: pageNumber,
        limit: limitNumber,
        totalItems: totalBrands,
        totalPages: Math.ceil(totalBrands / limitNumber),
        hasNextPage:
          limitNumber === "all"
            ? false
            : pageNumber * limitNumber < totalBrands,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getShopInfo,
  getDetailBrand,
  getFilterBrands,
};
