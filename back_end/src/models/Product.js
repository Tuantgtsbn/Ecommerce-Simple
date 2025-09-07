const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    category: {
      name: {type: String, required: true},
      slug: {type: String, required: true},
    },
    brand: {
      name: {type: String, required: true},
      slug: {type: String, required: true},
      logo: {type: String},
    },
    attributes: [
      {
        name: {type: String, required: true},
        value: [{type: String, required: true}],
      },
    ],
    description: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      desktop: {
        type: [String],
        default: [
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8tp25a002-sb246-1-thumb.webp",
        ],
      },
      tablet: [String],
      mobile: [String],
    },
    images: {
      desktop: {
        type: [String],
        default: [
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8te24w012-sk010-thumb.webp",
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8tp24s006-sb227-thumb.webp",
        ],
      },
      tablet: [String],
      mobile: [String],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalDislikes: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["inStock", "outOfStock", "discontinued"],
      default: "inStock",
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
    collection: "products",
  },
);

ProductSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug("Product", this.name, postIdToExclude);
  }
  next();
});

// slug has unique:true in field definition; explicit index() removed to avoid duplicate
ProductSchema.index({categoryId: 1});
ProductSchema.index({brandId: 1});
ProductSchema.index({tags: 1});
ProductSchema.index({createdAt: -1});

const AttributeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    values: [
      {
        type: String,
        required: true,
        unique: true,
      },
    ],
  },
  {timestamps: true, collection: "attributes"},
);

// AttributeSchema.name has `unique: true`, no separate index() needed

const VariantAttributeSchema = new Schema(
  {
    name: {type: String, required: true},
    value: {type: String, required: true},
  },
  {_id: false},
);

const ProductVariantSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      desktop: {
        type: [String],
        default: [
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8te24w012-sk010-thumb.webp",
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8tp24s006-sb227-thumb.webp",
        ],
      },
      tablet: {
        type: [String],
        default: [
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8te24w012-sk010-thumb.webp",
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8tp24s006-sb227-thumb.webp",
        ],
      },
      mobile: {
        type: [String],
        default: [
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8te24w012-sk010-thumb.webp",
          "https://2885371169.e.cdneverest.net/pub/media/catalog/product/cache/500_750/8/t/8tp24s006-sb227-thumb.webp",
        ],
      },
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    name: {
      type: String,
      required: true,
    },
    attributeValues: [VariantAttributeSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {timestamps: true, collection: "productVariants"},
);

ProductVariantSchema.index({productId: 1});

const AttributeModel = mongoose.model("Attribute", AttributeSchema);
const ProductModel = mongoose.model("Product", ProductSchema);
const ProductVariantModel = mongoose.model(
  "ProductVariant",
  ProductVariantSchema,
);

module.exports = {AttributeModel, ProductModel, ProductVariantModel};
