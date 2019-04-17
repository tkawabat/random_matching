"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const routeHelper = require(rootDir + "/src/routeHelper");


router.get("/", routeHelper.check, (req, res) => {
    res.viewParam.user = req.user;
    res.render("help/index", res.viewParam);
});

router.get("/init", routeHelper.check, (req, res) => {
    res.viewParam.user = req.user;
    res.render("help/init", res.viewParam);
});

router.get("/push", routeHelper.check, (req, res) => {
    res.viewParam.user = req.user;
    res.render("help/push", res.viewParam);
});

router.get("/ng", routeHelper.check, (req, res) => {
    res.viewParam.user = req.user;
    res.render("help/ng", res.viewParam);
});

router.get("/faq", routeHelper.check, (req, res) => {
    res.viewParam.user = req.user;
    res.render("help/faq", res.viewParam);
});


module.exports = router;
