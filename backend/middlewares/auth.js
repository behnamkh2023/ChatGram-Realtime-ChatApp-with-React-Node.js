module.exports = (req, res, next) => {
  const accessToken = req.signedCookies["accessToken"] ?? "";
  if (!accessToken) {
    return res.status(401).json({
      status: "error",
      accessToken,
      code: "401",
      message: "you are not authorized",
    });
  }
  next();
};
