const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const draftSchema = Schema(
  {
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
      required: false,
    },
    type: {
      type: String,
      enum: ["reply", "edit", "normal"],
      required: false,
    },
    chatId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Draft = mongoose.model("draft", draftSchema);
