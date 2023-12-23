const createError = require("http-errors");
const JWT = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Users = require("../configs/db/models/mongoose/users");
const mongoose = require("mongoose");
const moment = require("moment-jalali");
const crypto = require("crypto");
require("../configs/db/connections/mongoose");
// const users = require("../configs/db/models/mongoose/users");
const axios = require('axios');
const qs = require('querystring');
const mimeTypes = require('mime-types');

function getTypeByFile(filePath) {
  const mimeType = mimeTypes.lookup(filePath);
  const typeParts = mimeType.split('/');
  const fileType = typeParts[1] || typeParts[0];
  return fileType;
}

function convertFileSize(sizeInBytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (sizeInBytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(sizeInBytes) / Math.log(1024)));

  return Math.round(100 * (sizeInBytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}

function secretKeyGenerator() {
  return crypto.randomBytes(32).toString("hex").toUpperCase();
}

function generateRandomNumber(length) {
  if (length === 5) {
    return Math.floor(10000 + Math.random() * 90000);
  }
  if (length === 6) {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

function toPersianDigits(n) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}
 
async function setAccessToken(res, user) {
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 1, // would expire after 1 days
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "development" ? false : true,
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : ".behnamkh.ir",
  };
  res.cookie(
    "accessToken",
    await generateToken(user, "1d", process.env.ACCESS_TOKEN_SECRET_KEY),
    cookieOptions
  );
}

async function setRefreshToken(res, user) {
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 365, // would expire after 1 year
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "development" ? false : true,
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : ".behnamkh.ir",
  };
  res.cookie(
    "refreshToken",
    await generateToken(user, "1y", process.env.REFRESH_TOKEN_SECRET_KEY),
    cookieOptions
  );
}

function generateToken(user, expiresIn, secret) {
  return new Promise((resolve, reject) => {
    const payload = {
      _id: user._id,
    };

    const options = {
      expiresIn,
    };

    JWT.sign(
      payload,
      secret || process.env.JWT_SECRET,
      options, 
      (err, token) => {
        if (err) reject(createError.InternalServerError("خطای سروری"));
        resolve(token);
      }
    );
  });
}
function verifyAccessToken(req,res) {
  const accessToken = req.signedCookies["accessToken"];
  if (!accessToken) {
    return res.status(401).json({
      StatusCode: 401,
      ddddd: 1111,
    });
  }
  const token = cookieParser.signedCookie(
    accessToken,
    process.env.COOKIE_PARSER_SECRET_KEY
  );
  return new Promise((resolve, reject) => {
    JWT.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_KEY,
      async (err, payload) => {
        try {
          if (err)
          return res.status(401).json({StatusCode: 401,     ddddd: 222,});
          const { _id } = payload;
          return resolve(_id);
        } catch (error) {
          return res.status(401).json({StatusCode: 401,ddddd: 4444,error:payload});
        }
      }
    );
  });
}
function verifyRefreshToken(req,res) {
  const refreshToken = req.signedCookies["refreshToken"];
  if (!refreshToken) {
    return res.status(401).json({
      StatusCode: 40144444,
    });
    // throw createError.Unauthorized("لطفا وارد حساب کاربری خود شوید.");
  }
  const token = cookieParser.signedCookie(
    refreshToken,
    process.env.COOKIE_PARSER_SECRET_KEY
  );
  return new Promise((resolve, reject) => {
    JWT.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET_KEY,
      async (err, payload) => {
        try {
          if (err)
          return res.status(401).json({StatusCode: 4022221,});
          const { _id } = payload;

          return resolve(_id);
        } catch (error) {
          return res.status(401).json({StatusCode: 401444,});
        }
      }
    );
  });
}

async function getUserCartDetail(userId) {
  const cartDetail = await Users.aggregate([
    {
      $match: { _id: userId },
    },
    {
      $project: { cart: 1, name: 1 },
    },
    {
      $lookup: {
        from: "products",
        localField: "cart.products.productId",
        foreignField: "_id",
        as: "productDetail",
      },
    },
    {
      $lookup: {
        from: "coupons",
        localField: "cart.coupon",
        foreignField: "_id",
        as: "coupon",
      },
    },
    {
      $project: {
        name: 1,
        coupon: { $arrayElemAt: ["$coupon", 0] },
        cart: 1,
        productDetail: {
          _id: 1,
          slug: 1,
          title: 1,
          icon: 1,
          discount: 1,
          price: 1,
          offPrice: 1,
          imageLink: 1,
        },
      },
    },
    {
      $addFields: {
        productDetail: {
          $function: {
            body: function (productDetail, products) {
              return productDetail.map(function (product) {
                const quantity = products.find(
                  (item) => item.productId.valueOf() == product._id.valueOf()
                ).quantity;
                // const totalPrice = count * product.price;
                return {
                  ...product,
                  quantity,
                  // totalPrice,
                  // finalPrice:
                  //   totalPrice - (product.discount / 100) * totalPrice,
                };
              });
            },
            args: ["$productDetail", "$cart.products"],
            lang: "js",
          },
        },
      },
    },
    {
      $addFields: {
        discountDetail: {
          $function: {
            body: function discountDetail(productDetail, coupon) {
              if (!coupon)
                return { newProductDetail: productDetail, coupon: null };
              const isExpiredCoupon =
                coupon.expireDate &&
                new Date(coupon.expireDate).getTime() < Date.now();
              const isReachedLimit = coupon.usageCount >= coupon.usageLimit;
              if (!coupon.isActive || isReachedLimit || isExpiredCoupon)
                return null;

              const newProductDetail = productDetail.map((product) => {
                if (product.discount) return product;
                if (coupon.productIds.find((id) => id.equals(product._id))) {
                  if (coupon.type === "fixedProduct") {
                    if (product.price < coupon.amount) return product;
                    return {
                      ...product,
                      offPrice: product.price - coupon.amount,
                    };
                  }
                  if (coupon.type === "percent") {
                    return {
                      ...product,
                      offPrice: parseInt(
                        product.price * (1 - coupon.amount / 100)
                      ),
                    };
                  }
                } else return product;
              });

              return {
                newProductDetail,
                coupon: { code: coupon.code, _id: coupon._id },
              };
            },
            args: ["$productDetail", "$coupon"],
            lang: "js",
          },
        },
      },
    },
    {
      $addFields: {
        payDetail: {
          $function: {
            body: function (productDetail, userName) {
              const totalPrice = productDetail.reduce((total, product) => {
                return total + parseInt(product.offPrice * product.quantity);
              }, 0);
              const totalGrossPrice = productDetail.reduce((total, product) => {
                return total + parseInt(product.price * product.quantity);
              }, 0);
              const totalOffAmount = productDetail.reduce((total, product) => {
                return (
                  total +
                  parseInt(
                    (product.price - product.offPrice) * product.quantity
                  )
                );
              }, 0);
              const orderItems = [];
              productDetail.map((product) => {
                orderItems.push({
                  price: product.offPrice,
                  product: product._id,
                });
              });
              const productIds = productDetail.map((product) =>
                product._id.valueOf()
              );
              const description = `${productDetail
                .map((p) => p.title)
                .join(" - ")} | ${userName}`;
              return {
                totalOffAmount, // including discount and coupon
                totalPrice,
                totalGrossPrice,
                orderItems,
                productIds,
                description,
              };
            },
            args: ["$discountDetail.newProductDetail", "$name"],
            lang: "js",
          },
        },
      },
    },
    {
      $set: {
        productDetail: "$discountDetail.newProductDetail",
        coupon: "$discountDetail.coupon",
      },
    },
    {
      $project: {
        cart: 0,
        name: 0,
        discountDetail: 0,
      },
    },
  ]);
  return copyObject(cartDetail);
}
function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}
function deleteInvalidPropertyInObject(data = {}, blackListFields = []) {
  // let nullishData = ["", " ", "0", 0, null, undefined];
  let nullishData = ["", " ", null, undefined];
  Object.keys(data).forEach((key) => {
    if (blackListFields.includes(key)) delete data[key];
    if (typeof data[key] == "string") data[key] = data[key].trim();
    if (Array.isArray(data[key]) && data[key].length > 0)
      data[key] = data[key].map((item) => item.trim());
    if (Array.isArray(data[key]) && data[key].length == 0) delete data[key];
    if (nullishData.includes(data[key])) delete data[key];
  });
}
async function checkProductExist(id) {
  const { ProductModel } = require("../app/models/product");
  if (!mongoose.isValidObjectId(id))
    throw createError.BadRequest("شناسه محصول ارسال شده صحیح نمیباشد");
  const product = await ProductModel.findById(id);
  if (!product) throw createError.NotFound("محصولی یافت نشد");
  return product;
}

function invoiceNumberGenerator() {
  return (
    moment().format("jYYYYjMMjDDHHmmssSSS") +
    String(process.hrtime()[1]).padStart(9, 0)
  );
}
function getNameByEmail(email) {
  return email.split("@")[0];
}
function generaExpireCodeTime(second) {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  return timestamp + second * 1000;
}






const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const GOOGLE_OAUTH_REDIRECT = process.env.GOOGLE_OAUTH_REDIRECT;

const getGoogleOauthToken = async (code) => {
  const rootURl = "https://oauth2.googleapis.com/token";
  const options = {
    code,
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: GOOGLE_OAUTH_REDIRECT,
    grant_type: "authorization_code",
  };
  try {
    const { data } = await axios.post(
      rootURl,
      qs.stringify(options),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

const getGoogleUser = async (id_token, access_token) => {
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return data;
  } catch (err) {
    throw Error(err);
  }
};

const getReplyMsgFromChat = (chat) => {
  let msg='';
  switch (chat.type) {
    case 'voice':
      msg = '🎤 Voice message';
      break;
      case 'img':
        msg = `📷 Photo`;
      break;
      case 'file':
        msg = `📂 ${chat.file.name}`;
      break;
      case 'msg':
        msg = chat.message;
      break;
    default:
      
      break;
  }
  return msg;
};



const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};





module.exports = {
  getGoogleOauthToken,
  getGoogleUser,
  generateRandomNumber,
  toPersianDigits,
  setAccessToken,
  setRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  getUserCartDetail,
  copyObject,
  deleteInvalidPropertyInObject,
  checkProductExist,
  invoiceNumberGenerator,
  secretKeyGenerator,
  getNameByEmail,
  generaExpireCodeTime,
  getTypeByFile,
  convertFileSize,
  getReplyMsgFromChat,
  isValidObjectId,
};
