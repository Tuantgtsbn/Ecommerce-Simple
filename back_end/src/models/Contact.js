const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ContactSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true, collection: "contacts"},
);

const ContactModel = mongoose.model("Contact", ContactSchema);

module.exports = {ContactModel};
