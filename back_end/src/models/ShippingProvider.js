const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShippingProviderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: String,
    logo: {
      type: String,
      default:
        "https://static.ybox.vn/2022/10/6/1665216192677-300402309_2710448215756061_5293639806893640453_n.jpg",
    },
    phone: String,
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
  {timestamps: true, collection: "shippingProviders"},
);

ShippingProviderSchema.index({slug: 1}, {unique: true});
ShippingProviderSchema.index({isActive: 1});

const ShippingProviderModel = mongoose.model(
  "ShippingProvider",
  ShippingProviderSchema,
);

module.exports = ShippingProviderModel;
