const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const AddressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true, collection: "addresses"},
);

AddressSchema.index({userId: 1});

const AddressModel = mongoose.model("Address", AddressSchema);

module.exports = {AddressModel};
