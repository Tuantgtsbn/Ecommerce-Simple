const mongoose = require("mongoose");
const {Schema} = mongoose;

// ===========================================
// USER SCHEMA
// ===========================================
const addressSchema = new Schema(
  {
    detail: {type: String, required: true},
    ward: {type: String, required: true},
    district: {type: String, required: true},
    city: {type: String, required: true},
    country: {type: String, default: "Vietnam"},
    phone: {type: String, required: true},
    notes: {type: String},
    isDefault: {type: Boolean, default: false},
  },
  {_id: true},
);

const wishlistItemSchema = new Schema(
  {
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    variantId: {type: Schema.Types.ObjectId, required: true},
    addedAt: {type: Date, default: Date.now},
  },
  {_id: false},
);

const cartItemSchema = new Schema(
  {
    variantId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, required: true, min: 1},
    addedAt: {type: Date, default: Date.now},
  },
  {_id: false},
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.socialLogin.googleId && !this.socialLogin.facebookId;
      },
    },
    role: {
      type: String,
      enum: ["admin", "customer", "staff"],
      default: "customer",
    },
    profile: {
      avatar: {type: String, default: ""},
      birthday: {type: Date},
      gender: {type: String, enum: ["male", "female", "other"]},
    },
    socialLogin: {
      googleId: {type: String, sparse: true},
      facebookId: {type: String, sparse: true},
    },
    addresses: [addressSchema],
    wishlist: [wishlistItemSchema],
    cart: {
      items: [cartItemSchema],
      updatedAt: {type: Date, default: Date.now},
    },
    isActive: {type: Boolean, default: true},
    emailVerified: {type: Boolean, default: false},
    lastLoginAt: {type: Date},
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Indexes
userSchema.index({email: 1}, {unique: true});
userSchema.index({username: 1}, {unique: true});
userSchema.index({"socialLogin.googleId": 1}, {sparse: true});
userSchema.index({"socialLogin.facebookId": 1}, {sparse: true});

const User = mongoose.model("User", userSchema);

// ===========================================
// SESSION SCHEMA
// ===========================================
const sessionSchema = new Schema(
  {
    _id: {type: String, required: true}, // session token
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    expiresAt: {type: Date, required: true, index: {expireAfterSeconds: 0}},
  },
  {
    timestamps: {createdAt: true, updatedAt: false},
  },
);

const Session = mongoose.model("Session", sessionSchema);

// ===========================================
// CATEGORY SCHEMA
// ===========================================
const categorySchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    description: {type: String},
    image: {type: String},
    isActive: {type: Boolean, default: true},
    sortOrder: {type: Number, default: 0},
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {type: Number, default: 0},
    path: [{type: Schema.Types.ObjectId, ref: "Category"}],
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategoryId",
});

categorySchema.index({slug: 1}, {unique: true});
categorySchema.index({parentCategoryId: 1});
categorySchema.index({isActive: 1, sortOrder: 1});

const Category = mongoose.model("Category", categorySchema);

// ===========================================
// BRAND SCHEMA
// ===========================================
const brandSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    description: {type: String},
    logo: {type: String},
    isActive: {type: Boolean, default: true},
  },
  {
    timestamps: true,
  },
);

brandSchema.index({slug: 1}, {unique: true});
brandSchema.index({isActive: 1});

const Brand = mongoose.model("Brand", brandSchema);

// ===========================================
// PRODUCT SCHEMA
// ===========================================
const attributeSchema = new Schema(
  {
    name: {type: String, required: true}, // Color, Size, Material
    values: [{type: String, required: true}], // Red, Blue, Green
  },
  {_id: false},
);

const variantAttributeSchema = new Schema(
  {
    attributeName: {type: String, required: true},
    value: {type: String, required: true},
  },
  {_id: false},
);

const productVariantSchema = new Schema(
  {
    sku: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    slug: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    basePrice: {type: Number, required: true, min: 0},
    discount: {type: Number, default: 0, min: 0, max: 100},
    quantity: {type: Number, required: true, min: 0},
    imageUrl: {type: String},
    attributeValues: [variantAttributeSchema],
    isActive: {type: Boolean, default: true},
  },
  {_id: true},
);

const productSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    description: {type: String, required: true},
    thumbnail: {type: String, required: true},
    images: [{type: String}],

    brandId: {type: Schema.Types.ObjectId, ref: "Brand", required: true},
    categoryId: {type: Schema.Types.ObjectId, ref: "Category", required: true},

    // Embedded for faster queries
    category: {
      name: {type: String, required: true},
      slug: {type: String, required: true},
    },
    brand: {
      name: {type: String, required: true},
      slug: {type: String, required: true},
      logo: {type: String},
    },

    attributes: [attributeSchema],
    variants: [productVariantSchema],

    basePrice: {type: Number, required: true, min: 0},
    maxDiscount: {type: Number, default: 0, min: 0, max: 100},
    tags: [{type: String, lowercase: true}],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    isActive: {type: Boolean, default: true},

    // Analytics & Reviews
    analytics: {
      totalReviews: {type: Number, default: 0, min: 0},
      averageRating: {type: Number, default: 0, min: 0, max: 5},
      totalRatings: {type: Number, default: 0, min: 0},
      totalLikes: {type: Number, default: 0, min: 0},
      totalDislikes: {type: Number, default: 0, min: 0},
      viewCount: {type: Number, default: 0, min: 0},
    },

    seo: {
      metaTitle: {type: String},
      metaDescription: {type: String},
      keywords: [{type: String}],
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Indexes
productSchema.index({slug: 1}, {unique: true});
productSchema.index({categoryId: 1});
productSchema.index({brandId: 1});
productSchema.index({"variants.sku": 1});
productSchema.index({status: 1, isActive: 1});
productSchema.index({tags: 1});
productSchema.index({"analytics.averageRating": -1});
productSchema.index({createdAt: -1});

// Virtual for reviews
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

const Product = mongoose.model("Product", productSchema);

// ===========================================
// REVIEW SCHEMA
// ===========================================
const reviewSchema = new Schema(
  {
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    variantId: {type: Schema.Types.ObjectId},

    // Embedded user info for display
    user: {
      username: {type: String, required: true},
      avatar: {type: String},
    },

    // Embedded product info
    product: {
      name: {type: String, required: true},
      thumbnail: {type: String},
    },

    rating: {type: Number, required: true, min: 1, max: 5},
    comment: {type: String, required: true, trim: true},
    images: [{type: String}],
    isVerifiedPurchase: {type: Boolean, default: false},
    helpfulCount: {type: Number, default: 0, min: 0},
    isApproved: {type: Boolean, default: true},
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({productId: 1});
reviewSchema.index({userId: 1});
reviewSchema.index({rating: 1});
reviewSchema.index({isApproved: 1});
reviewSchema.index({createdAt: -1});

const Review = mongoose.model("Review", reviewSchema);

// ===========================================
// COUPON SCHEMA
// ===========================================
const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {type: String, required: true, trim: true},
    discountType: {type: String, enum: ["percentage", "fixed"], required: true},
    discountValue: {type: Number, required: true, min: 0},
    minOrderAmount: {type: Number, default: 0, min: 0},
    maxDiscountAmount: {type: Number, min: 0},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    usageLimit: {type: Number, min: 0}, // null = unlimited
    usageLimitPerUser: {type: Number, default: 1, min: 1},
    usedCount: {type: Number, default: 0, min: 0},
    isActive: {type: Boolean, default: true},
    applicationType: {
      type: String,
      enum: ["all", "category", "product"],
      default: "all",
    },

    // For category-specific coupons
    applicableCategories: [{type: Schema.Types.ObjectId, ref: "Category"}],

    // For product-specific coupons
    applicableProducts: [{type: Schema.Types.ObjectId, ref: "Product"}],

    description: {type: String},
  },
  {
    timestamps: true,
  },
);

couponSchema.index({code: 1}, {unique: true});
couponSchema.index({isActive: 1, startDate: 1, endDate: 1});
couponSchema.index({applicationType: 1});

const Coupon = mongoose.model("Coupon", couponSchema);

// ===========================================
// ORDER SCHEMA
// ===========================================
const orderItemSchema = new Schema(
  {
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    variantId: {type: Schema.Types.ObjectId, required: true},
    productName: {type: String, required: true},
    variantName: {type: String, required: true},
    sku: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    quantity: {type: Number, required: true, min: 1},
    discount: {type: Number, default: 0, min: 0},
    thumbnail: {type: String},
    attributes: [
      {
        name: {type: String, required: true},
        value: {type: String, required: true},
      },
    ],
  },
  {_id: false},
);

const statusHistorySchema = new Schema(
  {
    status: {type: String, required: true},
    message: {type: String},
    timestamp: {type: Date, default: Date.now},
    updatedBy: {type: Schema.Types.ObjectId, ref: "User"},
  },
  {_id: false},
);

const orderSchema = new Schema(
  {
    orderNumber: {type: String, required: true, unique: true},
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},

    customer: {
      username: {type: String, required: true},
      email: {type: String, required: true},
      phone: {type: String, required: true},
    },

    items: [orderItemSchema],

    pricing: {
      subtotal: {type: Number, required: true, min: 0},
      shippingFee: {type: Number, default: 0, min: 0},
      totalDiscount: {type: Number, default: 0, min: 0},
      totalAmount: {type: Number, required: true, min: 0},
    },

    shippingAddress: {
      detail: {type: String, required: true},
      ward: {type: String, required: true},
      district: {type: String, required: true},
      city: {type: String, required: true},
      country: {type: String, default: "Vietnam"},
      phone: {type: String, required: true},
      recipientName: {type: String, required: true},
    },

    coupon: {
      couponId: {type: Schema.Types.ObjectId, ref: "Coupon"},
      code: {type: String},
      discountAmount: {type: Number, default: 0, min: 0},
    },

    payment: {
      method: {
        type: String,
        enum: ["cod", "vnpay", "momo", "zalopay", "bank_transfer"],
        default: "cod",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
        default: "pending",
      },
      transactionId: {type: String},
      paymentDate: {type: Date},
      amount: {type: Number, min: 0},
      currency: {type: String, default: "VND"},
      payerName: {type: String},
      payerEmail: {type: String},
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipping",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },

    statusHistory: [statusHistorySchema],

    cancellation: {
      reason: {type: String},
      cancelledBy: {type: String, enum: ["customer", "admin"]},
      cancelledAt: {type: Date},
    },

    shipping: {
      providerId: {type: Schema.Types.ObjectId, ref: "ShippingProvider"},
      providerName: {type: String},
      trackingNumber: {type: String},
      estimatedDelivery: {type: Date},
      actualDelivery: {type: Date},
    },

    notes: {type: String}, // Internal notes
  },
  {
    timestamps: true,
  },
);

// Indexes
orderSchema.index({userId: 1});
orderSchema.index({status: 1});
orderSchema.index({orderNumber: 1}, {unique: true});
orderSchema.index({createdAt: -1});
orderSchema.index({"payment.status": 1});

const Order = mongoose.model("Order", orderSchema);

// ===========================================
// BLOG CATEGORY SCHEMA
// ===========================================
const blogCategorySchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    description: {type: String},
    imageUrl: {type: String},
    isActive: {type: Boolean, default: true},
    sortOrder: {type: Number, default: 0},
  },
  {
    timestamps: true,
  },
);

blogCategorySchema.index({slug: 1}, {unique: true});
blogCategorySchema.index({isActive: 1, sortOrder: 1});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);

// ===========================================
// POST SCHEMA
// ===========================================
const postCategorySchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    name: {type: String, required: true},
    slug: {type: String, required: true},
  },
  {_id: false},
);

const postSchema = new Schema(
  {
    title: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    content: {type: String, required: true},
    excerpt: {type: String, required: true},

    categories: [postCategorySchema],

    author: {
      authorId: {type: Schema.Types.ObjectId, ref: "User", required: true},
      username: {type: String, required: true},
      avatar: {type: String},
    },

    featuredImage: {
      url: {type: String, required: true},
      altText: {type: String},
    },

    engagement: {
      viewCount: {type: Number, default: 0, min: 0},
      likeCount: {type: Number, default: 0, min: 0},
      dislikeCount: {type: Number, default: 0, min: 0},
      commentCount: {type: Number, default: 0, min: 0},
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    visibility: {type: String, enum: ["public", "private"], default: "public"},

    seo: {
      metaTitle: {type: String},
      metaDescription: {type: String},
      keywords: [{type: String}],
    },

    publishedAt: {type: Date},
    tags: [{type: String, lowercase: true}],
  },
  {
    timestamps: true,
  },
);

postSchema.index({slug: 1}, {unique: true});
postSchema.index({status: 1, visibility: 1});
postSchema.index({"author.authorId": 1});
postSchema.index({publishedAt: -1});
postSchema.index({tags: 1});

const Post = mongoose.model("Post", postSchema);

// ===========================================
// CONTACT SCHEMA
// ===========================================
const contactSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, lowercase: true, trim: true},
    phone: {type: String, required: true},
    subject: {type: String, required: true, trim: true},
    message: {type: String, required: true, trim: true},
    isRead: {type: Boolean, default: false},

    response: {
      message: {type: String},
      respondedBy: {type: Schema.Types.ObjectId, ref: "User"},
      respondedAt: {type: Date},
    },

    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

contactSchema.index({isRead: 1});
contactSchema.index({status: 1});
contactSchema.index({createdAt: -1});

const Contact = mongoose.model("Contact", contactSchema);

// ===========================================
// SHIPPING PROVIDER SCHEMA
// ===========================================
const shippingProviderSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    description: {type: String},
    logo: {type: String},
    phone: {type: String},
    isActive: {type: Boolean, default: true},

    config: {
      apiKey: {type: String},
      baseUrl: {type: String},
      webhookUrl: {type: String},
    },

    pricing: {
      baseRate: {type: Number, default: 0},
      perKgRate: {type: Number, default: 0},
      freeShippingThreshold: {type: Number, default: 0},
    },
  },
  {
    timestamps: true,
  },
);

shippingProviderSchema.index({slug: 1}, {unique: true});
shippingProviderSchema.index({isActive: 1});

const ShippingProvider = mongoose.model(
  "ShippingProvider",
  shippingProviderSchema,
);

// ===========================================
// SHOP INFORMATION SCHEMA
// ===========================================
const shopInformationSchema = new Schema(
  {
    name: {type: String, required: true, trim: true},

    address: {
      detail: {type: String, required: true},
      ward: {type: String, required: true},
      district: {type: String, required: true},
      city: {type: String, required: true},
      country: {type: String, default: "Vietnam"},
    },

    contact: {
      phone: {type: String, required: true},
      email: {type: String, required: true, lowercase: true},
      website: {type: String},
    },

    logo: {type: String},
    description: {type: String},

    socialMedia: {
      facebook: {type: String},
      instagram: {type: String},
      youtube: {type: String},
      tiktok: {type: String},
    },

    businessHours: {
      monday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
      tuesday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
      wednesday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
      thursday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
      friday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
      saturday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
      sunday: {
        open: String,
        close: String,
        isClosed: {type: Boolean, default: false},
      },
    },

    settings: {
      currency: {type: String, default: "VND"},
      timezone: {type: String, default: "Asia/Ho_Chi_Minh"},
      language: {type: String, default: "vi"},
      taxRate: {type: Number, default: 0},
    },

    policies: {
      returnPolicy: {type: String},
      shippingPolicy: {type: String},
      privacyPolicy: {type: String},
      termsOfService: {type: String},
    },
  },
  {
    timestamps: true,
  },
);

const ShopInformation = mongoose.model(
  "ShopInformation",
  shopInformationSchema,
);

// ===========================================
// EXPORTS
// ===========================================
module.exports = {
  User,
  Session,
  Category,
  Brand,
  Product,
  Review,
  Coupon,
  Order,
  BlogCategory,
  Post,
  Contact,
  ShippingProvider,
  ShopInformation,
};
