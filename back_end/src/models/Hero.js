const mongoose = require("mongoose");
const {Schema} = mongoose;

const bannerHeroSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: {
      destop: {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          required: true,
        },
        width: {
          type: Number,
          default: 1920,
        },
        height: {
          type: Number,
          default: 1080,
        },
      },
      tablet: {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          required: true,
        },
        width: {
          type: Number,
          default: 1280,
        },
        height: {
          type: Number,
          default: 800,
        },
      },
      mobile: {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          required: true,
        },
        width: {
          type: Number,
          default: 640,
        },
        height: {
          type: Number,
          default: 480,
        },
      },
    },
    cta: {
      text: {
        type: String,
        maxlength: 200,
      },
      url: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["primary", "secondary", "outline"],
        default: "primary",
      },
      isExternal: {
        type: Boolean,
        default: false,
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        maxlength: 160,
      },
      keywords: [
        {
          type: String,
        },
      ],
    },
    createBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updateBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "bannerHeros",
  },
);

bannerHeroSchema.index({isActive: 1, order: 1});
bannerHeroSchema.index({startDate: 1, endDate: 1});
bannerHeroSchema.index({createdAt: -1});

bannerHeroSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  const isInTimeRange =
    !this.endDate || (this.startDate <= now && now <= this.endDate);
  return this.isActive && isInTimeRange;
});

bannerHeroSchema.methods.getImageByDevice = function (deviceType) {
  const validDevices = ["desktop", "tablet", "mobile"];
  const device = validDevices.includes(deviceType) ? deviceType : "desktop";
  return this.images[device];
};

bannerHeroSchema.statics.getActiveBanners = function (limit = 10) {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: {$lte: now},
    $or: [{endDate: {$exists: false}}, {endDate: null}, {endDate: {$gte: now}}],
  })
    .sort({order: 1, createdAt: -1})
    .limit(limit);
};

bannerHeroSchema.pre("save", function (next) {
  if (this.endDate && this.startDate > this.endDate) {
    const error = new Error("startDate must be before endDate");
    error.name = "ValidationError";
    error.status = 400;
    return next(error);
  }
  next();
});

const BannerHero = mongoose.model("BannerHero", bannerHeroSchema);
module.exports = BannerHero;
