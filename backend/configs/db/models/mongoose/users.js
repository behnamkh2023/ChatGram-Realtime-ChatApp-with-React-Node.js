const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    avatar: { type: String },
    mobile: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: false},
    bio: { type: String },
    token: { type: String },
    code: { type: Number },
    lastOnline: { type: Date, default: Date.now },
    expireCode: { type: Number },
    role: { type: String, default: "USER" },
    lang: { type: String, default: "en" },
  },
  { timestamps: true }
);

module.exports = users = mongoose.model("User", usersSchema);
