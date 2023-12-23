const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = Schema(
  {
    userID1: {
      type: String,
      required: true,
    },
    userID2: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
      required: true,
    },
    reply: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["file", "msg", "img", "voice"],
      required: true,
    },
    file: {
      name: { type: String },
      type: { type: String },
      size: { type: String },
    },
    seen: {
      type: String,
      enum: ["0", "1", "2"],
      default: "0",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Chat = mongoose.model("chat", chatSchema);
