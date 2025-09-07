const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;
const {generateUniqueSlug} = require("../helpers/slug");

const ShopSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      detail: {type: String, required: true},
      ward: {type: String, required: true},
      district: {type: String, required: true},
      city: {type: String, required: true},
      country: {type: String, default: "Vietnam"},
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    logo: {
      type: String,
      default:
        "https://toppng.com/uploads/preview/logo-png-images-free-nike-logo-transparent-11562934947mhvvjcktas.png",
    },
    description: String,
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
  {timestamps: true, collation: "shops"},
);

const BrandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default:
        "https://toppng.com/uploads/preview/logo-png-images-free-nike-logo-transparent-11562934947mhvvjcktas.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {timestamps: true, collation: "brands"},
);

BrandSchema.index({name: 1, createdAt: 1});

BrandSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug("Brand", this.name, postIdToExclude);
  }
  next();
});

const BrandModel = mongoose.model("Brand", BrandSchema);
const ShopModel = mongoose.model("Shop", ShopSchema);

module.exports = {BrandModel, ShopModel};
