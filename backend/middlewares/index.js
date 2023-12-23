const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  optionSuccessStatus: 200,
};
module.exports = (app) => {
  app.use(bodyParser.json());
  app.use(cors(corsOptions));
  app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
};
