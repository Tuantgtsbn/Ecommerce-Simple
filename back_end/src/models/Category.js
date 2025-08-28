const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
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
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/flat-black-friday-horizontal-sale-banner_23-2149101407.jpg?ga=GA1.1.46639973.1727789063&semt=ais_hybrid&w=740",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    collection: "categories",
  },
);

CategorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategoryId",
});

CategorySchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug(
      "Category",
      this.name,
      postIdToExclude,
    );
    this.updated_at = new Date();
  }
  next();
});

CategorySchema.index({parentCategoryId: 1});

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = {CategoryModel};
