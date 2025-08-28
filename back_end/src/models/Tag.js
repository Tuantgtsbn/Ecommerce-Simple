const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {generateUniqueSlug} = require("../utils/slugGenerator");

const TagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {timestamps: true, collection: "tags"},
);

TagSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    const postIdToExclude = this.isNew ? null : this._id;
    this.slug = await generateUniqueSlug("Tag", this.name, postIdToExclude);
  }
  next();
});

const TagModel = mongoose.model("Tag", TagSchema);
module.exports = TagModel;
