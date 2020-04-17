"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const routeHelper = require(rootDir + "/src/routeHelper");


router.get("/", routeHelper.check, (req, res) => {
    res.render("arena/index", res.viewParam);
});

router.get("/room", routeHelper.check, (req, res) => {
    res.render("arena/room", res.viewParam);
});



module.exports = router;
