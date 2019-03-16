"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");


router.get("/", account.isAuthenticated, routeHelper.check, function(req, res) {
    res.viewParam.user = req.user;
    res.render("user", res.viewParam);
});

router.post("/", account.isAuthenticated, validator.user, routeHelper.check, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/user/?warning=validate");
        return;
    }

    let user = req.user;
    user.sex = user.sex ? user.sex : req.body.sex;
    user.skype_id = req.body.skype_id;
    user.save((err, user) => {
        if (err) {
            res.redirect("/user/?warning=user_save");
            return;
        }
        res.viewParam.user = user;
        res.viewParam.info = "user_save";
        res.redirect("/user/?info=user_save");
    });

});


module.exports = router;
