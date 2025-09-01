const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {generateUniqueSlug} = require("../helpers/slug");

const PostsSchema = new Schema(
  {
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
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "BlogCategories",
          required: true,
        },
      },
    ],
    totalDislikes: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "rejected"],
      default: "draft",
    },
    authors: [
      {
        authorId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        authorName: {
          type: String,
          required: true,
        },
      },
    ],
    thumbnail: {
      desktop: {
        url: {
          type: String,
          default: "",
        },
        alt: {
          type: String,
          default: "",
        },
      },
      tablet: {
        url: {
          type: String,
          default: "",
        },
        alt: {
          type: String,
          default: "",
        },
      },
      mobile: {
        url: {
          type: String,
          default: "",
        },
        alt: {
          type: String,
          default: "",
        },
      },
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    tags: [
      {
        tagId: {
          type: Schema.Types.ObjectId,
          ref: "Tags",
        },
        tagName: {
          type: String,
        },
        slug: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "posts",
  },
);

PostsSchema.index({createdAt: 1});

PostsSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("title")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug("Posts", this.title, postIdToExclude);
  }
  next();
});

const PostsModel = mongoose.model("Posts", PostsSchema);

module.exports = {PostsModel};
