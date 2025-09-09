const {CouponModel} = require("../../models/Coupon");
const {OrderModel} = require("../../models/Orders");

const applyCoupon = async (couponCode) => {
  const {id: userId} = req.user;
  const fakeProducts = [
    {
      categoryId: "64a7f4f4c9e77b001f3e8b19",
      productId: "64a7f4f4c9e77b001f3e8b1a",
      variantId: "64a7f4f4c9e77b001f3e8b1b",
      quantity: 2,
      price: 100,
    },
  ];
  try {
    const coupon = await CouponModel.findOneWithTargets({
      code: couponCode,
      isActive: true,
      startDate: {$lt: new Date()},
      $or: [
        {endDate: {$exists: false}},
        {endDate: null},
        {endDate: {$gte: now}},
      ],
      usedCount: {$lt: "$usageLimit"},
    });
    if (!coupon)
      return res.status(404).json({
        success: false,
        message: "Coupon's invalid",
      });

    if (coupon.usageLimitPerUser) {
      const couponOrder = await OrderModel.countDocuments({
        userId,
        "coupon.couponId": coupon._id,
      });
      if (couponOrder > coupon.usageLimitPerUser)
        return res.status(400).json({
          success: false,
          message: "You have used this coupon before",
        });
    }
    const result = {};
    const discountPrice =
      coupon.discountType === "percentage"
        ? (totalAmount * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.type === "all") {
      const totalAmount = fakeProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      );
      if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Order must be at least ${coupon.minOrderAmount} to use this coupon`,
        });
      }
      const totalDiscount = coupon.maxDiscountAmount
        ? Math.max(coupon.maxDiscountAmount, discountPrice)
        : discountPrice;
      result.items = fakeProducts;
      result.totalDiscount = totalDiscount;
      result.discountType = coupon.discountType;
      result.discountValue = coupon.discountValue;
    } else if (coupon.type === "category") {
      const categoryIds = coupon.couponCategories.map((c) => c._id.toString());
      const applicableProducts = fakeProducts.filter((p) =>
        categoryIds.includes(p.categoryId.toString()),
      );
      if (applicableProducts.length === 0)
        return res.status(400).json({
          success: false,
          message: "No applicable products",
        });
      const applicableAmount = applicableProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      );
      if (coupon.minOrderAmount && applicableAmount < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Order must be at least ${coupon.minOrderAmount} to use this coupon`,
        });
      }
      const totalDiscount = coupon.maxDiscountAmount
        ? Math.max(coupon.maxDiscountAmount, discountPrice)
        : discountPrice;
      result.items = applicableProducts;
      result.totalDiscount = totalDiscount;
      result.discountType = coupon.discountType;
      result.discountValue = coupon.discountValue;
    } else if (coupon.type === "product") {
      const productIds = coupon.couponProducts.map((c) => c._id.toString());
      const applicableProducts = fakeProducts.filter((p) =>
        productIds.includes(p.productId.toString()),
      );
      if (applicableProducts.length === 0)
        return res.status(400).json({
          success: false,
          message: "No applicable products",
        });
      const applicableAmount = applicableProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      );
      if (coupon.minOrderAmount && applicableAmount < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Order must be at least ${coupon.minOrderAmount} to use this coupon`,
        });
      }
      const totalDiscount = coupon.maxDiscountAmount
        ? Math.max(coupon.maxDiscountAmount, discountPrice)
        : discountPrice;

      result.items = applicableProducts;
      result.totalDiscount = totalDiscount;
      result.discountType = coupon.discountType;
      result.discountValue = coupon.discountValue;
    } else {
      return res.status(400).json({
        success: false,
        message: "Coupon's invalid",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  applyCoupon,
};
