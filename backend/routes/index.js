const authRouter = require("./auth");
const dashRouter = require("./dash");

module.exports = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", dashRouter);
};
