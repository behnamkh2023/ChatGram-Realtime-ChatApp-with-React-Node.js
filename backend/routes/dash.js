const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const usersController = require("../controllers/users");
const chatsController = require("../controllers/chats");
const draftsController = require("../controllers/draft");
const { uploadVoice, uploadFile, uploadImg } = require("../middlewares/upload");

const upImg = uploadImg.fields([{ name: "image", maxCount: 1 }]);
const upVoice = uploadVoice.fields([{ name: "voiceMessage", maxCount: 1 }]);
const upFiles = uploadFile.fields([{ name: "file", maxCount: 1 }]);

router.post("/users", authMiddleware, usersController.getUsers);
router.get("/pv", authMiddleware, usersController.pv);
router.get("/messages", authMiddleware, chatsController.messages);
router.get("/draft", authMiddleware, draftsController.getDraft);
router.post("/updateUser", upImg, usersController.updateUser);
router.post("/uploadVoice", upVoice, chatsController.uploadVoice);
router.post("/uploadImage", upImg, chatsController.uploadImage);
router.post("/uploadFile", upFiles, chatsController.uploadFile);

module.exports = router;
