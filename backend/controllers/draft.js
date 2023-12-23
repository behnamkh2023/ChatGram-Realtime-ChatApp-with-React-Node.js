const Draft = require("../configs/db/models/mongoose/draft");
require("../configs/db/connections/mongoose");

exports.draft = async (message, sender, receiver, type, chatId) => {
  const draft = await Draft.find({
    sender,
    receiver,
  });
  if (draft.length == 0) {
    const draft = new Draft({
      sender,
      receiver,
      message,
      type,
      chatId,
    });
    await draft.save();
  } else {
    await Draft.updateOne({ sender, receiver }, { message, chatId, type });
  }
  const draft2 = await Draft.find({
    sender,
    receiver,
  });
};

exports.deleteDraft = async (sender, receiver) => {
  await Draft.deleteOne({ sender, receiver });
};

exports.getDraft = async (req, res) => {
  const { myId: sender, pvId: receiver } = req.query;
  const draft = await Draft.find({
    sender,
    receiver,
  }).select("message");
  res.status(200).json(draft);
};

exports.get = async (filter) => {
  try {
    const draft = await Draft.findOne(filter);
    return draft;
  } catch (error) {
    console.error("Error retrieving data:", error);
    throw error;
  }
};
exports.update = async (filter, data) => {
  await Draft.updateOne(filter, { $set: data });
};
