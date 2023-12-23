const express = require("express");
const passport = require("passport");
const router = express.Router();
const usersController = require("../controllers/users");
const auth = require("../middlewares/auth");

// router.get("/behnam", (req, res) => {
//   res.send("xxxxxxxxx");
// });
router.get("/get-user", auth, usersController.getUser);
router.post("/get-otp", usersController.getOtp);
router.post("/check-otp", usersController.checkOtp);
router.get("/refresh-token", usersController.refreshToken);
router.get("/login-success", usersController.loginByPassport);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/logout", usersController.logout);
router.get(
  "/sessions/oauth/google",
  passport.authenticate("google", {
    successRedirect: `${process.env.HOST_URL}/api/v1/auth/login-success`,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
