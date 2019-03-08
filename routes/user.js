"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");


router.get("/", function(req, res, next) {
    console.log(req.user);
    res.render("user", { title: "らんだむまっちんぐ", user: req.user });
});


module.exports = router;
