const {CouponModel: Coupon} = require("../../models/Coupon");
const {CategoryModel: Category} = require("../../models/Category");
const {ProductModel: Product} = require("../../models/Product");

const validateDiscountType = (v) => ["percentage", "fixed_amount"].includes(v);
const validateCouponType = (v) => ["all", "category", "product"].includes(v);

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
      type = "all",
      couponCategories = [],
      couponProducts = [],
      isActive = true,
    } = req.body;

    if (!code || !name) {
      return res
        .status(400)
        .json({success: false, message: "code and name are required"});
    }
    if (!validateDiscountType(discountType)) {
      return res
        .status(400)
        .json({success: false, message: "discountType invalid"});
    }
    if (!validateCouponType(type)) {
      return res.status(400).json({success: false, message: "type invalid"});
    }
    const existing = await Coupon.findOne({code});
    if (existing) {
      return res
        .status(409)
        .json({success: false, message: "Coupon code already exists"});
    }

    // validate referenced categories/products if provided
    if (Array.isArray(couponCategories) && couponCategories.length) {
      const ids = couponCategories.map((c) => c.categoryId).filter(Boolean);
      const count = await Category.countDocuments({_id: {$in: ids}}).exec();
      if (count !== ids.length) {
        return res.status(400).json({
          success: false,
          message:
            "One or more couponCategories refer to non-existent categories",
        });
      }
    }
    if (Array.isArray(couponProducts) && couponProducts.length) {
      const ids = couponProducts.map((p) => p.productId).filter(Boolean);
      const count = await Product.countDocuments({_id: {$in: ids}}).exec();
      if (count !== ids.length) {
        return res.status(400).json({
          success: false,
          message: "One or more couponProducts refer to non-existent products",
        });
      }
    }

    const newCoupon = new Coupon({
      code,
      name,
      discountType,
      discountValue: Number(discountValue) || 0,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: usageLimit !== undefined ? Number(usageLimit) : 100,
      usageLimitPerUser:
        usageLimitPerUser !== undefined ? Number(usageLimitPerUser) : null,
      usedCount: 0,
      isActive: !!isActive,
      type,
      couponCategories: Array.isArray(couponCategories) ? couponCategories : [],
      couponProducts: Array.isArray(couponProducts) ? couponProducts : [],
    });

    await newCoupon.save();

    return res
      .status(201)
      .json({success: true, message: "Coupon created", data: newCoupon});
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({success: false, message: error.message});
  }
};

const updateCoupon = async (req, res) => {
  try {
    const {id} = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon)
      return res
        .status(404)
        .json({success: false, message: "Coupon not found"});

    const {
      code,
      name,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
      isActive,
      type,
      couponCategories,
      couponProducts,
    } = req.body;

    if (code && code !== coupon.code) {
      const exists = await Coupon.findOne({code, _id: {$ne: id}});
      if (exists)
        return res
          .status(409)
          .json({success: false, message: "Coupon code already in use"});
      coupon.code = code;
    }
    if (name !== undefined) coupon.name = name;
    if (discountType !== undefined) {
      if (!validateDiscountType(discountType))
        return res
          .status(400)
          .json({success: false, message: "discountType invalid"});
      coupon.discountType = discountType;
    }
    if (discountValue !== undefined)
      coupon.discountValue = Number(discountValue || 0);
    if (minOrderAmount !== undefined)
      coupon.minOrderAmount = Number(minOrderAmount || 0);
    if (maxDiscountAmount !== undefined)
      coupon.maxDiscountAmount = Number(maxDiscountAmount || 0);
    if (startDate !== undefined)
      coupon.startDate = startDate ? new Date(startDate) : coupon.startDate;
    if (endDate !== undefined)
      coupon.endDate = endDate ? new Date(endDate) : null;
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (usageLimitPerUser !== undefined)
      coupon.usageLimitPerUser =
        usageLimitPerUser === null ? null : Number(usageLimitPerUser);
    if (isActive !== undefined) coupon.isActive = !!isActive;
    if (type !== undefined) {
      if (!validateCouponType(type))
        return res.status(400).json({success: false, message: "type invalid"});
      coupon.type = type;
    }

    // If couponCategories provided, validate and replace
    if (couponCategories !== undefined) {
      if (!Array.isArray(couponCategories))
        return res
          .status(400)
          .json({success: false, message: "couponCategories must be an array"});
      const ids = couponCategories.map((c) => c.categoryId).filter(Boolean);
      const count = await Category.countDocuments({_id: {$in: ids}}).exec();
      if (count !== ids.length)
        return res.status(400).json({
          success: false,
          message:
            "One or more couponCategories refer to non-existent categories",
        });
      coupon.couponCategories = couponCategories;
    }

    if (couponProducts !== undefined) {
      if (!Array.isArray(couponProducts))
        return res
          .status(400)
          .json({success: false, message: "couponProducts must be an array"});
      const ids = couponProducts.map((p) => p.productId).filter(Boolean);
      const count = await Product.countDocuments({_id: {$in: ids}}).exec();
      if (count !== ids.length)
        return res.status(400).json({
          success: false,
          message: "One or more couponProducts refer to non-existent products",
        });
      coupon.couponProducts = couponProducts;
    }

    await coupon.save();
    return res
      .status(200)
      .json({success: true, message: "Coupon updated", data: coupon});
  } catch (error) {
    console.error("Update coupon error:", error);
    return res.status(500).json({success: false, message: error.message});
  }
};

/**
 * Add a target to an existing coupon. Body: {targetType: 'category'|'product', targetId, name?}
 */
const addCouponTarget = async (req, res) => {
  try {
    const {id} = req.params; // coupon id
    const {targetType, targetId, name} = req.body;
    if (!targetType || !["category", "product"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "targetType must be 'category' or 'product'",
      });
    }
    if (!targetId)
      return res
        .status(400)
        .json({success: false, message: "targetId is required"});

    const coupon = await Coupon.findById(id);
    if (!coupon)
      return res
        .status(404)
        .json({success: false, message: "Coupon not found"});

    if (targetType === "category") {
      const cat = await Category.findById(targetId);
      if (!cat)
        return res
          .status(404)
          .json({success: false, message: "Category not found"});
      // avoid duplicates
      const exists = (coupon.couponCategories || []).some(
        (c) => String(c.categoryId) === String(targetId),
      );
      if (exists)
        return res
          .status(409)
          .json({success: false, message: "Category already added to coupon"});
      coupon.couponCategories.push({
        name: name || cat.name,
        categoryId: targetId,
      });
    } else {
      const prod = await Product.findById(targetId);
      if (!prod)
        return res
          .status(404)
          .json({success: false, message: "Product not found"});
      const exists = (coupon.couponProducts || []).some(
        (p) => String(p.productId) === String(targetId),
      );
      if (exists)
        return res
          .status(409)
          .json({success: false, message: "Product already added to coupon"});
      coupon.couponProducts.push({
        name: name || prod.name,
        productId: targetId,
      });
    }

    await coupon.save();
    return res
      .status(200)
      .json({success: true, message: "Target added to coupon", data: coupon});
  } catch (error) {
    console.error("Add coupon target error:", error);
    return res.status(500).json({success: false, message: error.message});
  }
};

module.exports = {createCoupon, updateCoupon, addCouponTarget};
