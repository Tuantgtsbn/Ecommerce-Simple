const mongoose = require("mongoose");
const schema = mongoose.Schema;
const slugify = require("slugify");
const PostsSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    default: "",
  },
  categories: [
    {
      category_id: {
        type: schema.Types.ObjectId,
        ref: "BlogCategories",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
  dislike_count: {
    type: Number,
    default: 0,
  },
  like_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  published_at: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["draft", "published", "scheduled", "rejected"],
    default: "draft",
  },
  author: {
    author_id: {
      type: schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author_name: {
      type: String,
      required: true,
    },
  },
  featured_image: {
    url: {
      type: String,
      default: "",
    },
    alt_text: {
      type: String,
      default: "",
    },
  },
  view_count: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
});
async function generateUniqueSlug(title, postIdExclude = null) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: "vi",
  });
  let uniqueSlug = baseSlug;
  let counter = 0;
  let query = {slug: uniqueSlug};
  if (postIdExclude) {
    query._id = {$ne: postIdExclude};
  }
  while (await mongoose.model("Posts").findOne(query)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
    query.slug = uniqueSlug;
  }
  return uniqueSlug;
}
PostsSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("title")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug(this.title, postIdToExclude);
    this.updated_at = new Date();
  }
  next();
});
const PostsModel = mongoose.model("Posts", PostsSchema);
module.exports = {
  PostsModel,
  generateUniqueSlug,
};
