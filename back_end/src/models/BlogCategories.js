const {mongoose} = require("../config/db");
const {generateUniqueSlug} = require("../helpers/slug");
const Schema = mongoose.Schema;

const BlogCategoriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {timestamps: true, collection: "blogCategories"},
);

BlogCategoriesSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug(
      "BlogCategories",
      this.name,
      postIdToExclude,
    );
    this.updated_at = new Date();
  }
  next();
});

BlogCategoriesSchema.index({name: 1, createdAt: 1});

const BlogCategoriesModel = mongoose.model(
  "BlogCategories",
  BlogCategoriesSchema,
);

module.exports = {BlogCategoriesModel};
