const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: 100,
    },
    usageLimitPerUser: {
      type: Number,
      default: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["all", "category", "product"],
      default: "all",
    },
    couponCategories: [
      {
        name: String,
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "Category",
        },
      },
    ],
    couponProducts: [
      {
        name: String,
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "coupons",
  },
);

// code has unique:true in field definition; explicit index() removed to avoid duplicate
CouponSchema.index({isActive: 1, startDate: 1, endDate: 1});
CouponSchema.index({type: 1});

const CouponModel = mongoose.model("Coupon", CouponSchema);

module.exports = {CouponModel};
