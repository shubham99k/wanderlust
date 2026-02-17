const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// signup form render route
router.get("/signup", userController.renderSignupForm);

// signup form submit route
router.post("/signup", wrapAsync(userController.signup));

// login form render route
router.get("/login", userController.renderLoginForm);

// login form submit route
router.post("/login",saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.login);

//logout route
router.get("/logout", userController.logout);


module.exports = router;