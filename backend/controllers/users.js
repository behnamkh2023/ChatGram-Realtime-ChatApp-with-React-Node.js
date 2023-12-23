require("../configs/db/connections/mongoose");
const fs  = require('fs');
// const mongoose = require("mongoose");
const Users = require("../configs/db/models/mongoose/users");
const Chats = require("../configs/db/models/mongoose/chat");
const service_email = require("../services/email");
const {
  getGoogleOauthToken,
  getGoogleUser,
  generateRandomNumber,
  toPersianDigits,
  setAccessToken,
  setRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  getUserCartDetail,
  getNameByEmail,
  generaExpireCodeTime,
  isValidObjectId,
} = require("../utils/functions");

exports.test = async (req, res) => {
  return res.status(201).json({ send: "csdcsccxxsc cs" });
};

exports.getOtp = async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).send(" ایمیل معتبر را وارد کنید");
  const code = generateRandomNumber(6);
  const expireCode = generaExpireCodeTime(90);
  try {
    const result = await Users.findOne({ email });
    if (result == null) {
      const newUsers = await new Users({
        email,
        code,
        username: getNameByEmail(email),
        expireCode,
      });
      const news = await newUsers.save();
      process.env.NODE_ENV === "production" &&
        service_email.email(
          email,
          "Code Verification",
          `Code for you : ${code}`
        );
      res.status(201).send({ status: true, email, news, code, expireCode });
    } else {
      await Users.updateOne({ email }, { code, expireCode });
      const user = await Users.findOne({ email }).select(
        "email username lang role avatar lastOnline"
      );
      process.env.NODE_ENV === "production" &&
        service_email.email(
          email,
          "Code Verification",
          `Code for you : ${code}`
        );
      res.status(200).send({ status: true, email, code, expireCode });
    }
  } catch (error) {}
};

exports.checkOtp = async (req, res) => {
  const { code, email } = req.body;
  const user = await Users.findOne({ email }).select(
    "email username lang role avatar lastOnline code expireCode"
  );
  if (!user)
    return res
      .status(404)
      .send({ status: 404, text: "Failed to use with these specifications" });

  if (user.code != code)
    return res
      .status(400)
      .send({ status: 400, text: "The code sent is not valid" });

  if (user.expireCode < Date.now())
    return res
      .status(404)
      .send({ status: 404, text: "Validation code has expired" });

  await user.save();
  await setAccessToken(res, user);
  await setRefreshToken(res, user);
  let WELLCOME_MESSAGE = "The code has been confirmed, you have come to the chatgram front";
  await Users.updateOne({ email }, { isActive: true });
  return res.status(200).json({
    success: true,
    data: {
      message: WELLCOME_MESSAGE,
      message1: user.expireCode,
      message2: Date.now(),
      user,
    },
  });
};
exports.loginByPassport = async (req, res) => {
  const {
    sub,
    name,
    given_name,
    family_name,
    email,
    picture: avatar,
    email_verified,
    locale,
  } = req.user._json;
  try {
    const existingUser = await Users.findOne({email})
    if (existingUser) {
    } else {
      const newUser = new Users({
        email: email,
        username: getNameByEmail(email),
        avatar,
      });
      await newUser.save();
    }
    const user = await Users.findOne({ email: email });
    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    await Users.updateOne({ email }, { isActive: true });
    res.redirect(process.env.FRONTEND_ORIGIN);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_ORIGIN}/login`);
  }
};
exports.getUser = async (req, res) => {
  const userId = await verifyAccessToken(req, res);
  const user = await Users.findById(userId);
  if (user) {
    return res.status(200).json({
      StatusCode: 200,
      user,
    });
  } else {
    return res.status(401).json({
      StatusCode: 401,
    });
  }
};

exports.refreshToken = async (req, res) => {
  const userId = await verifyRefreshToken(req, res);
  if (typeof userId == "string") {
    const user = await Users.findById(userId);
    if (user) {
      await setAccessToken(res, user);
      await setRefreshToken(res, user);
      return res.status(200).json({
        StatusCode: 200,
        user,
      });
    } else {
      return res.status(401).json({
        StatusCode: 401,
      });
    }
  }
};
exports.logout = async (req, res) => {
  const cookieOptions = {
    maxAge: 1,
    expires: Date.now(),
    httpOnly: true,
    signed: true,
    sameSite: "Lax",
    secure: true,
    path: "/",
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : ".behnamkh.ir",
  };
  res.cookie("accessToken", null, cookieOptions);
  res.cookie("refreshToken", null, cookieOptions);

  return res.status(200).json({
    StatusCode: 200,
    roles: null,
    auth: false,
  });
};

exports.getUsers = async (req, res) => {
  const users = await Users.find().select(
    "email isActive username lang role avatar lastOnline"
  );
  return res.json(users);
};
exports.getById = async (userId) => {
  const user = await Users.findById(userId);
  if (user) {
    return user;
  } else {
    return false;
  }
};

exports.pv = async (req, res) => {
  const { pvId } = req.query;
  if (!isValidObjectId(pvId)) {
    return res.status(400).json({ error: 'User ID required.' });
  }
  try {

    const userPv = await Users.findById(pvId).select(
      "email username lang role avatar lastOnline"
      );
      return res.send({ userPv });
  } catch (error) {
    return res.status(500).json({"error":error.message});
  }

};

exports.googleOauthHandler = async (req, res) => {
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

  try {
    const code = req.query.code;
    const pathUrl = req.query.state || "/";

    if (!code) {
      return res.status(401).json({
        status: "fail",
        message: "Authorization code not provided!",
      });
    }

    const { id_token, access_token } = await getGoogleOauthToken({ code });

    const { name, verified_email, email, picture } = await getGoogleUser({
      id_token,
      access_token,
    });

    if (!verified_email) {
      return res.status(403).json({
        status: "fail",
        message: "Google account not verified",
      });
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        createdAt: new Date(),
        name,
        email,
        photo: picture,
        password: "",
        verified: true,
        provider: "Google",
      },
      update: { name, email, photo: picture, provider: "Google" },
    });

    if (!user) return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);

    const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
    const TOKEN_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ sub: user.id }, TOKEN_SECRET, {
      expiresIn: `${TOKEN_EXPIRES_IN}m`,
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
    });

    res.redirect(`${FRONTEND_ORIGIN}/${pathUrl}`);
  } catch (err) {
    return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
  }
};

exports.update = async (userId) => {
  const update = { lastOnline: new Date() };
  Users.updateOne({ _id: userId }, update)
};

exports.updateUser = async (req, res) => {
  if (req.files.image != undefined) {
    const filePath =
      process.env.HOST_URL +
      "/" +
      req.files.image[0].path.slice(7).replace(/\\/g, "/");
    req.body.image = filePath;
  }
  const params = req.body;
  const item = await Users.findOne({ _id: req.body.userID }).exec();

  let obj = {};
  params.image != undefined ? (obj.avatar = params.image) : "";
  params.firstName && (obj.firstName = params.firstName);
  obj.lastName = params.lastName;
  if (item) {
    const update = await Users.updateOne({ _id: req.body.userID }, obj);
    if (item.avatar != undefined && req.files.image != undefined) {
      const imgURL = new URL(item.avatar);
      const imgPath = imgURL.pathname;
      fs.unlink("./public" + imgPath, (err) => {
        if (err) console.log(err);
        else {
          console.log("\nDeleted Symbolic Link: symlinkToFile");
        }
      });
    }
  } else {
    let user = new Users({ userID: params.userID, avatar: params.avatar });
    user.save(function (err, doc) {
      if (err) return console.error(err);
    });
  }
  const settings = await Users.findOne({ _id: params.userID }).exec();
  return res.json(settings);
};
