"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const routeHelper = require(rootDir + "/src/routeHelper");


router.get("/", routeHelper.check, (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/user/");
    } else {
        res.render("index", res.viewParam);
    }
});

router.get("/twitter/login", account.passport.authenticate("twitter"), (req, res) => {
    res.json({ user: req.user });
});

router.get("/twitter/callback", account.passport.authenticate("twitter", {
    successRedirect: "/user/",
    failureRedirect: "/?warning=twitter_auth_failed"
}));

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});


module.exports = router;
