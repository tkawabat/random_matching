"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");


router.get("/", account.isAuthenticated, routeHelper.check, (req, res) => {
    res.render("user", { user: req.user });
});

router.post("/", account.isAuthenticated, validator.user, routeHelper.check, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/user/?err=validate");
        return;
    }

    let user = req.user;
    user.sex = req.body.sex;
    user.skype_id = req.body.skype_id;
    user.save((err, user) => {
        if (err) {
            res.redirect("/user/?err=save");
            return;
        }
        res.render("user", { user: user });
    });

});


module.exports = router;
