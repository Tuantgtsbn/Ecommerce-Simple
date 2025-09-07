const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const ContactSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    response: {
      message: {type: String},
      respondedBy: {type: Schema.Types.ObjectId, ref: "User"},
      respondedAt: {type: Date},
    },
  },
  {timestamps: true, collection: "contacts"},
);

const ContactModel = mongoose.model("Contact", ContactSchema);

module.exports = {ContactModel};
