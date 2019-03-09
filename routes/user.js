"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");


router.get("/", account.isAuthenticated, function(req, res) {
    res.render("user", { title: "らんだむまっちんぐ", user: req.user });
});


module.exports = router;
