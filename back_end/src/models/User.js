const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },
    role: {
      type: String,
      enum: ["client", "admin", "staff"],
      default: "client",
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    birthday: {
      type: Date,
      default: Date.parse("2000-01-01"),
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}},
);

UserSchema.index({googleId: 1}, {sparse: true});
UserSchema.index({facebookId: 1}, {sparse: true});

const User = mongoose.model("User", UserSchema);

module.exports = User;
