const {cleanObject} = require("../../helpers/filter");
const {CouponModel: Coupon} = require("../../models/Coupon");

const getFilterCoupons = async (req, res) => {
  try {
    const {
      type = "all",
      page,
      limit,
      sortBy,
      sortOrder,
      isActive = "true",
    } = cleanObject(req.query, [
      "type",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "isActive",
    ]);
    const filter = {};
    if (type && ["all", "category", "product"].includes(type)) {
      filter.type = type;
    }
    if (isActive !== undefined) {
      filter.isActive = parseInt(isActive) || isActive === "true";
    }
    const sortOption = {};
    if (typeof sortBy === "string" && ["name", "createdAt"].includes(sortBy)) {
      sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOption["name"] = 1;
    }
    const query = Coupon.find(filter).sort(sortOption);
    const pageNumber = page ? (parseInt(page) ?? 1) : 1;
    const limitNumber = limit ? (parseInt(limit) ?? "all") : "all";
    if (limitNumber !== "all") {
      query.skip((pageNumber - 1) * limitNumber).limit(limitNumber);
    } else {
      query.skip((pageNumber - 1) * 10);
    }
    // Run count and query in parallel
    const [countRes, queryRes] = await Promise.allSettled([
      Coupon.countDocuments(filter).exec(),
      query.exec(),
    ]);

    const totalCoupons = countRes.status === "fulfilled" ? countRes.value : 0;
    const coupons = queryRes.status === "fulfilled" ? queryRes.value : [];

    // Populate targets per coupon according to its type
    await Promise.all(
      coupons.map(async (c) => {
        try {
          if (typeof c.populateTargets === "function") {
            await c.populateTargets();
          } else {
            // fallback: populate both fields
            await c.populate("couponCategories.categoryId", "name slug");
            await c.populate("couponProducts.productId", "name slug basePrice");
          }
        } catch (e) {
          // continue on error
          c = null;
          return null;
        }
      }),
    );
    const filteredCoupons = coupons.filter((coupon) => !!coupon);

    const totalPages =
      limitNumber === "all"
        ? 1
        : Math.max(1, Math.ceil(totalCoupons / limitNumber));

    return res.status(200).json({
      success: true,
      data: filteredCoupons,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems: totalCoupons,
        totalPages,
        hasNextPage:
          limitNumber === "all"
            ? false
            : pageNumber * limitNumber < totalCoupons,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get filter coupons error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getFilterCoupons,
};
