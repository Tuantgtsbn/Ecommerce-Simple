const mongoose = require("mongoose");
const slugify = require("slugify");

async function generateUniqueSlug(model, title, postIdExclude = null) {
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
  while (await mongoose.model(model).findOne(query)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
    query.slug = uniqueSlug;
  }
  return uniqueSlug;
}

module.exports = {generateUniqueSlug};
