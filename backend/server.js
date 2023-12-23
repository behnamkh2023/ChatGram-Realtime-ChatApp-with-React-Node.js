require("dotenv").config();
const cookieSession = require("cookie-session");
const express = require("express");
const passportSetup = require("./middlewares/passport");
const passport = require("passport");
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 9000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  },
});

app.use(express.static("public"));
app.use(
  cookieSession({ name: "session", keys: ["lama", "anotherKey", "yetAnotherKey"], maxAge: 1000000 })
);   
 
app.use(passport.initialize());
app.use(passport.session());
 

require("./middlewares")(app); 
require("./routes")(app);
require("./middlewares/socket")(io);
exports.io = io;

httpServer.listen(port, () => {
  console.log(`Server is connected : ${port}`);
});