"use strict";

const rootDir = require("app-root-path");
const express = require("express");
const router = express.Router();
const account = require(rootDir + "/src/account");


router.get("/", function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/user');
    } else {
        res.render("index", { title: "Express" });
    }
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
    console.log(req.user);
    res.render("user", { title: "らんだむまっちんぐ", user: req.user });
});

module.exports = router;
