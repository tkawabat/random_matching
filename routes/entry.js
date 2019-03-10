"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");


router.get("/", account.isAuthenticated, function(req, res) {
    res.render("user", { user: req.user });
});

router.post("/", account.isAuthenticated, validator.user, function(req, res) {
    if (validator.isError(req)) {
        res.redirect("/user/?err=validate");
        return;
    }

    let user = req.user;
    user.sex = req.body.sex;
    user.skype_id = req.body.skype_id;
    user.save(function(err, user) {
        if (err) {
            res.redirect("/user/?err=save");
            return;
        }
        res.render("user", { user: user });
    });

});


module.exports = router;
