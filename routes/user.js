"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const logger = require(rootDir+"/src/log4js");
const cache = require(rootDir + "/src/cache");
const account = require(rootDir + "/src/account");
const User = require(rootDir + "/src/model/user");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");


router.get("/", account.isAuthenticated, routeHelper.check, function(req, res) {
    res.viewParam.user = req.user;
    res.render("user", res.viewParam);
});

router.post("/", account.isAuthenticated, validator.user, routeHelper.check, (req, res) => {
    let user = req.user;
    res.viewParam.user = user;

    if (validator.isError(req)) {
        res.viewParam.alert_warning = "入力値に問題があります";
        res.status(400).render("user", res.viewParam);
        return;
    }

    user.sex = user.sex ? user.sex : req.body.sex;
    user.skype_id = req.body.skype_id;
    if (req.body.ng_list) {
        user.ng_list = req.body.ng_list.filter(v => v !== "");
    } else {
        user.ng_list = [];
    }
    if (req.body.push_match && req.body.push_match === "on") {
        user.push.match = true;
    } else {
        user.push.match = false;
    }

    User.model.set(user, (err, user) => {
        if (err) {
            res.viewParam.alert_warning = "ユーザー情報の更新に失敗しました";
            res.status(500).render("user", res.viewParam);
            return;
        }
        res.viewParam.alert_info = "ユーザー情報を更新しました";
        res.viewParam.user = user;
        res.render("user", res.viewParam);
    });

});


module.exports = router;
