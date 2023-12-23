let activeUsers = [];
const usersController = require("../controllers/users");
const chatsController = require("../controllers/chats");
const draftsController = require("../controllers/draft");
const { getReplyMsgFromChat } = require("../utils/functions");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`${socket.id} connected`, socket.handshake.query.userId);
    const userIndex = searchActiveUsers(
      activeUsers,
      socket.handshake.query.userId
    );
    if (userIndex == -1) {
      activeUsers.push({
        socketId: socket.id,
        userId: socket.handshake.query.userId,
      });
    } else {
      activeUsers[userIndex].socketId = socket.id;
    }

    socket.on(`getOnline`, () => {
      socket.emit(`getOnline`, activeUsers);
    });
    io.emit(`online`, activeUsers);
    socket.emit(`online`, activeUsers);

    socket.on("info-user", async ({ item, me }) => {
      const getLastOne = await chatsController.getLastOne(me, item._id);
      io.to(socket.id).emit("info-user", getLastOne);
    });

    socket.on(
      "uploadPercentage",
      ({ progress, type: endpoint, pvId, myId }) => {
        const callerIndex = searchActiveUsers(activeUsers, myId);
        if (callerIndex != -1) {
          io.to(activeUsers[callerIndex].socketId).emit("uploadPercentage", {
            progress,
            type: endpoint,
            pvId,
            myId,
          });
        }
      }
    );

    socket.on(
      "send-message",
      async ({ msg, sender, receiver, replyId, chatId }) => {
        const userIndex = searchActiveUsers(activeUsers, receiver);
        const status = (await chatId)
          ? chatsController.update(msg, chatId)
          : chatsController.save(msg, sender, receiver, replyId);
        if (status) {
          await draftsController.deleteDraft(sender, receiver);
          const messages = await chatsController.get(sender, receiver);
          const oldMessages = await chatsController.getOldMessages(
            sender,
            receiver
          );
          const newMessages = await chatsController.getNewMessages(
            sender,
            receiver
          );
          const getLastOne = await chatsController.getLastOne(receiver, sender);
          io.to(socket.id).emit(`getNewMessages`, {
            newMessages,
            sender,
            receiver,
          });
          if (userIndex > -1) {
            io.to(activeUsers[userIndex].socketId).emit(
              "info-user",
              getLastOne
            );
            io.to(activeUsers[userIndex].socketId).emit(`getNewMessages`, {
              newMessages,
              sender,
              receiver,
            });
            io.to(activeUsers[userIndex].socketId).emit(`notification`);
          }
        }
      }
    );

    socket.on(
      "uploadVoice",
      async ({ id, filePath, sender, receiver, reply, chatId }) => {
        await chatsController.updateById({ id, reply });
        const messages = await chatsController.get(sender, receiver);

        io.to(socket.id).emit(`send-message`, { messages, sender, receiver });
        const getLastOne = await chatsController.getLastOne(receiver, sender);
        const userIndex = searchActiveUsers(activeUsers, receiver);
        if (userIndex != -1) {
          io.to(activeUsers[userIndex].socketId).emit("info-user", getLastOne);
          io.to(activeUsers[userIndex].socketId).emit(`send-message`, {
            messages,
            sender,
            receiver,
          });
          io.to(activeUsers[userIndex].socketId).emit(`notification`);
        }
      }
    );

    socket.on("deleteMsg", async ({ idMsg, pvId, myId }) => {
      await chatsController.delete(idMsg, pvId, myId);
      io.to(socket.id).emit(`deleteMsg`, { idMsg, pvId, myId });
      const userIndex = searchActiveUsers(activeUsers, pvId);
      if (userIndex != -1) {
        io.to(activeUsers[userIndex].socketId).emit(`deleteMsg`, {
          idMsg,
          pvId,
          myId,
        });
      }
    });

    socket.on("seen", async ({ sender, receiver }) => {
      const seen = await chatsController.seen(sender, receiver);
      const getCountNewMessages = await chatsController.getCountNewMessages(
        sender,
        receiver
      );
      const newMessages = await chatsController.getNewMessages(
        sender,
        receiver
      );
      io.to(socket.id).emit(`info-user${receiver}`, getCountNewMessages);
      io.to(socket.id).emit(`getNewMessages`, {
        newMessages,
        sender,
        receiver,
      });
      const userIndex = searchActiveUsers(activeUsers, sender);
      if (userIndex != -1) {
        io.to(activeUsers[userIndex].socketId).emit(`getNewMessages`, {
          newMessages,
          sender,
          receiver,
        });
      }
    });
    socket.on("seenById", async ({ msgId, sender, receiver, msg }) => {
      await chatsController.seenMsg(msgId);
      const getCountNewMessages = await chatsController.getCountNewMessages(
        sender,
        receiver
      );

      io.to(socket.id).emit(`info-user${sender}`, getCountNewMessages);
      io.emit(`seenById${msgId}`);
    });

    socket.on("editMsg", async ({ msg, msgId, receiver, sender }) => {
      await draftsController.draft(msg, sender, receiver, "edit", msgId);
      const getdraft = await draftsController.get({ sender, receiver });
      const chat = await chatsController.getById(msgId);
      if (chat.sender) {
        const user = await usersController.getById(chat.sender);
        io.to(socket.id).emit(`editMsg`, {
          draftId: getdraft._id,
          type: getdraft.type,
          draftMsg: getdraft.message,
          msgId,
          msg,
          username: user.username,
        });
      }
    });
    socket.on("replyMsg", async ({ msg, msgId, receiver, sender }) => {
      await draftsController.draft("", sender, receiver, "reply", msgId);
      const getdraft = await draftsController.get({ sender, receiver });
      const chat = await chatsController.getById(msgId);
      if (chat.sender) {
        const user = await usersController.getById(chat.sender);
        const msg = getReplyMsgFromChat(chat);
        io.to(socket.id).emit(`replyMsg`, {
          draftId: getdraft._id,
          type: getdraft.type,
          draftMsg: getdraft.message,
          msgId,
          msg,
          username: user.username,
        });
      }
    });
    socket.on("getReplyMsg", async ({ sender, receiver }) => {
      const getdraft = await draftsController.get({ sender, receiver });
      if (getdraft && getdraft.type && getdraft.chatId) {
        const chat = await chatsController.getById(getdraft.chatId);
        const user = await usersController.getById(sender);
        io.to(socket.id).emit(`replyMsg`, {
          draftId: getdraft._id,
          type: getdraft.type,
          draftMsg: getdraft.message,
          msgId: chat._id,
          msg: chat.message,
          username: user.username,
        });
      }
    });
    socket.on("getEditMsg", async ({ sender, receiver }) => {
      const getdraft = await draftsController.get({ sender, receiver });
      if (getdraft && getdraft.type && getdraft.chatId) {
        const chat = await chatsController.getById(getdraft.chatId);
        const user = await usersController.getById(sender);
        io.to(socket.id).emit(`editMsg`, {
          draftId: getdraft._id,
          type: getdraft.type,
          draftMsg: getdraft.message,
          msgId: chat._id,
          msg: chat.message,
          username: user.username,
        });
      }
    });
    socket.on("deleteReplyMsg", async (draftId) => {
      await draftsController.update(
        { _id: draftId },
        { chatId: "", type: "", message: "" }
      );
      io.to(socket.id).emit(`deleteReplyMsg`);
    });
    socket.on("deleteEditMsg", async (draftId) => {
      await draftsController.update(
        { _id: draftId },
        { chatId: "", type: "", message: "" }
      );
      io.to(socket.id).emit(`deleteEditMsg`);
    });
    socket.on("istyping", async ({ msg, reciver, sender }) => {
      draftsController.draft(msg, sender, reciver);
      const userIndex = searchActiveUsers(activeUsers, reciver);
      if (userIndex != -1) {
        io.to(activeUsers[userIndex].socketId).emit(`istyping`, {
          reciver,
          sender,
        });
      }
    });
    socket.on("disconnect", () => {
      const userIndex = searchActiveUsers(
        activeUsers,
        socket.handshake.query.userId
      );
      if (userIndex > -1) {
        activeUsers.splice(userIndex, 1);
      }
      console.log("disconnect", activeUsers);
      usersController.update(socket.handshake.query.userId);
      io.emit(`offline`, activeUsers);
    });
  });
};

const searchActiveUsers = (users, searchId) => {
  return users.findIndex((element) => element.userId == searchId);
};
