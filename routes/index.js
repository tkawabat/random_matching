"use strict";

var rootDir = require("app-root-path");
var express = require("express");
var router = express.Router();
var account = require(rootDir + "/src/account");

/* GET home page. */
router.get("/", function(req, res, next) {
    res.render("index", { title: "Express" });
});

router.get("/twitter/login",
    account.passport.authenticate("twitter"), (req, res) => {
        res.json({ user: req.user });
    });

router.get("/twitter/callback",
    account.passport.authenticate("twitter", { 
        successRedirect: "/user",
        failureRedirect: "/?auth_failed"
    }));

router.get("/user", account.isAuthenticated, function(req, res) {
    console.log(account.passport.session.id);
    res.send("respond with a resource");
});

router.get("/socket", function (req, res, next) {
    console.log(req.user);
    // 認証保護
    if (account.session && account.session.id){
        //
    } else {
        res.redirect("/");
    }
    res.render("socket", { title: "Express" });
});

module.exports = router;
