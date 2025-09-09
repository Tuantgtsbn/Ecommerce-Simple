const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
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
      default: null,
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

/**
 * Populate related targets based on coupon.type
 * - 'category' => populate couponCategories.categoryId
 * - 'product'  => populate couponProducts.productId
 * - 'all'      => populate both
 */
CouponSchema.methods.populateTargets = async function () {
  if (!this) return this;
  if (this.type === "category") {
    // modern mongoose: populate returns a promise, older versions used execPopulate()
    if (typeof this.populate === "function") {
      await this.populate("couponCategories.categoryId", "_id name slug");
    }
  } else if (this.type === "product") {
    if (typeof this.populate === "function")
      await this.populate(
        "couponProducts.productId",
        "_id name slug basePrice",
      );
  }
  return this;
};

/**
 * Find by id and populate targets according to type
 */
CouponSchema.statics.findByIdWithTargets = async function (id) {
  const doc = await this.findById(id);
  if (!doc) return null;
  await doc.populateTargets();
  return doc;
};

/**
 * Find one by query and populate targets according to type
 */
CouponSchema.statics.findOneWithTargets = async function (query) {
  const doc = await this.findOne(query);
  if (!doc) return null;
  await doc.populateTargets();
  return doc;
};

const CouponModel = mongoose.model("Coupon", CouponSchema);

module.exports = {CouponModel};
