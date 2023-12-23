const fs = require("fs");
const Chats = require("../configs/db/models/mongoose/chat");
const { getTypeByFile, convertFileSize } = require("../utils/functions");
const usersController = require("../controllers/users");
const chatsController = require("../controllers/chats");
require("../configs/db/connections/mongoose");


exports.updateById = async ({id,reply}) => {
  try {
    const result = await Chats.updateOne({ _id: id }, { reply });
    if (result.nModified === 0) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

exports.save = async (msg, sender, receiver, reply) => {
  let chat = new Chats({
    userID1: sender,
    userID2: receiver,
    sender,
    receiver,
    message: msg,
    type: "msg",
    reply,
  });
  let chats = await chat
    .save()
    .then((res) => {
      return true;
    })
    .catch((err) => {
      return false;
    });
  return chats;
};

exports.update = async (msg, chatId) => {
  try {
    const result = await Chats.updateOne({ _id: chatId }, { message: msg,edited:true });
    if (result.nModified === 0) {
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

exports.messages = async (req, res) => {
  const { myId, pvId } = req.query;
  const userID1 = myId;
  const userID2 = pvId;
  const chats = await Chats.find({
    $or: [
      {
        $and: [{ userID1: userID1 }, { userID2: userID2 }],
      },
      {
        $and: [{ userID1: userID2 }, { userID2: userID1 }],
      },
    ],
  });
  const allChat = await chatsController.integrateMsg(chats)
  return res.status(200).json(allChat);
};
exports.get = async (sender, receiver) => {
  const chats = await Chats.find({
    $or: [
      {
        $and: [{ userID1: sender }, { userID2: receiver }],
      },
      {
        $and: [{ userID1: receiver }, { userID2: sender }],
      },
    ],
  })
    .then((res) => {
      return res;
    })
    .catch((err) => console.log(err));
    const allChat = await chatsController.integrateMsg(chats)
  return allChat;
};

exports.getById = async (chatId) => {
  const chat = await Chats.findById(chatId);
  return chat ?? false;
};

exports.getLastOne = (userId, meId) => {
  const chats = Chats.find({
    $or: [
      {
        $and: [{ userID1: meId }, { userID2: userId }],
      },
    ],
  })
    .then((docs) => {
      if (docs.length > 0) {
        let seen = 0;
        docs.map((item) => item.seen == 0 && seen++);
        return {
          msg: docs[docs.length - 1].message,
          time: docs[docs.length - 1].createdAt,
          type: docs[docs.length - 1].type,
          file: docs[docs.length - 1].file,
          id: userId,
          seen,
          me: meId,
        };
      } else {
        return {
          msg: "",
          time: "",
          seen: 0,
          id: userId,
          me: meId,
        };
      }
    })
    .catch((err) => console.log(err));

  return chats;
};



exports.seen = async (sender, receiver) => {
  await Chats.updateMany({ sender, receiver, seen: "0" }, { seen: "1" });
};

exports.delete = async (idMsg, pvId, myId) => {
  try {
    const message = await Chats.findOne({ _id: idMsg });

    if (!message) {
      return;
    }

    const result = await Chats.deleteOne({ _id: idMsg });

    if (result.deletedCount > 0) {
      if (message.message) {
        const filePath = message.message.replace(
          process.env.HOST_URL,
          "./public/"
        );
        fs.unlink(filePath, (err) => {});
      }
    }
  } catch (error) {
    console.error( error.message);
  }
};

exports.seenMsg = async (msgId) => {
  await Chats.updateMany({ _id: msgId, seen: "0" }, { seen: "1" });
};

exports.getOldMessages = async (sender, receiver) => {
  const chats = await Chats.find({
    $or: [
      {
        $and: [{ userID1: sender }, { userID2: receiver }, { seen: "1" }],
      },
      {
        $and: [{ userID1: receiver }, { userID2: sender }, { seen: "1" }],
      },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .then((res) => {
      return res.reverse();
    })
    .catch((err) => console.log(err));
  return chats;
};
exports.getNewMessages = async (sender, receiver) => {
  const chats = await Chats.find({
    $or: [
      {
        $and: [
          { userID1: sender },
          { userID2: receiver },
        ],
      },
      {
        $and: [
          { userID1: receiver },
          { userID2: sender },
        ],
      },
    ],
  })
    .then((res) => {
      return res;
    })
    .catch((err) => console.log(err));


    const allChat = await chatsController.integrateMsg(chats)
  return allChat;
};

exports.getCountNewMessages = async (sender, receiver) => {
  const chats = await Chats.find({
    $or: [
      {
        $and: [{ userID1: sender }, { userID2: receiver }, { seen: "0" }],
      },
      {
        $and: [{ userID1: receiver }, { userID2: sender }, { seen: "0" }],
      },
    ],
  })
    .then((res) => {
      return res;
    })
    .catch((err) => console.log(err));
  return chats;
};

exports.integrateMsg = async (chats) => {
  const updatedArr = [];
  if (chats) {
    for (const ite of chats) {
      const item = ite._doc;
      if (item.reply) {
        const chat = await chatsController.getById(item.reply);
        const user = await usersController.getById(item.sender);
        updatedArr.push({
          ...item,
          replyUsername: user.username,
          replyMessage: chat.message,
          replyType: chat.type,
          replyFile: chat.file,
          replyChatId: chat._id,
        });
      } else {
        updatedArr.push(item);
      }
    }
  }
  return updatedArr;
};

exports.uploadVoice = async (req, res) => {
  if (req.files.voiceMessage != undefined) {
    const filePath =
      process.env.HOST_URL +"/"+
      req.files.voiceMessage[0].path.slice(7).replace(/\\/g, "/");
    const fileP =
      "public/"+
      req.files.voiceMessage[0].path.slice(7).replace(/\\/g, "/");
    req.body.filePath = filePath;
    req.body.fileP = fileP;
  }
  const params = req.body;
  let chat = new Chats({
    userID1: params.sender,
    userID2: params.receiver,
    sender: params.sender,
    receiver: params.receiver,
    message: params.filePath,
    type: "voice",
  });
  let chats = await chat
    .save()
    .then((res) => {
      return {
        status: true,
        filePath: params.filePath,
        sender: params.sender,
        receiver: params.receiver,
        id: res._id,
      };
    })
    .catch((err) => {
      return { status: false };
    });
  return res.json(chats);
};
exports.uploadImage = async (req, res) => {
  if (req.files.image != undefined) {
    const filePath =
      process.env.HOST_URL +"/"+
      req.files.image[0].path.slice(7).replace(/\\/g, "/");
    req.body.filePath = filePath;
  }

  const file = {
    name: req.files.image[0].originalname,
    type: getTypeByFile(req.files.image[0].originalname),
    size: convertFileSize(req.files.image[0].size),
  };

  const params = req.body;
  let chat = new Chats({
    userID1: params.sender,
    userID2: params.receiver,
    sender: params.sender,
    receiver: params.receiver,
    message: params.filePath,
    type: "img",
    file,
  });
  let chats = await chat
    .save()
    .then((res) => {
      return {
        status: true,
        filePath: params.filePath,
        sender: params.sender,
        receiver: params.receiver,
        id: res._id,
      };
    })
    .catch((err) => {
      return { status: false };
    });
  return res.json(chats);
};

exports.uploadFile = async (req, res) => {
  if (req.files.file != undefined) {
    const filePath =
      process.env.HOST_URL +"/"+
      req.files.file[0].path.slice(7).replace(/\\/g, "/");
    req.body.filePath = filePath;
  }
  const file = {
    name: req.files.file[0].originalname,
    type: getTypeByFile(req.files.file[0].originalname),
    size: convertFileSize(req.files.file[0].size),
  };

  const params = req.body;
  let chat = new Chats({
    userID1: params.sender,
    userID2: params.receiver,
    sender: params.sender,
    receiver: params.receiver,
    message: params.filePath,
    type: "file",
    file,
  });
  let chats = await chat
    .save()
    .then((res) => {
      return {
        status: true,
        filePath: params.filePath,
        sender: params.sender,
        receiver: params.receiver,
        id: res._id,
      };
    })
    .catch((err) => {
      return { status: false };
    });
  return res.json(chats);
};