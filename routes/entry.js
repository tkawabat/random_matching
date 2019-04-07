"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const schedule = require(rootDir + "/src/schedule");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const entryHelper = require(rootDir + "/src/entryHelper");
const Entry = require(rootDir + "/src/model/entry");


router.get("/",
    account.isAuthenticated,
    routeHelper.check,
    entryHelper.get,
    (req, res) => {
        res.viewParam.user = req.user;
        res.viewParam.registered = req.user.sex && req.user.skype_id;
        res.viewParam.twitter_safe = entryHelper.isSafeTwitter(req.user);
        res.viewParam.isReady = {
            act2: res.viewParam.registered
                && res.viewParam.twitter_safe
            ,act3_7: res.viewParam.registered
                && res.viewParam.twitter_safe
                && entryHelper.isAct3_7EntryTime()
        };

        if (res.viewParam.matched && res.viewParam.matched.length === 1) {
            res.render("entry_fail", res.viewParam);
        } else if (res.viewParam.matched) {
            res.render("entry_success", res.viewParam);
        } else if (res.viewParam.entry) {
            res.render("entry_now", res.viewParam);
        } else {
            res.render("entry_ready", res.viewParam);
        }
    });

router.post("/", account.isAuthenticated, validator.entry, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/entry/?warning=validate");
        return;
    }

    if (!req.user.sex || !req.user.skype_id) {
        res.redirect("/entry/?warning=not_registered");
        return;
    }
    if (!entryHelper.isSafeTwitter(req.user)) {
        res.redirect("/entry/?warning=twitter_unsafe");
        return;
    }

    const entry = {
        _id: req.user._id
        ,type: [req.body.entry_type]
    };
    Entry.schema.findOneAndUpdate({"_id": entry._id}, entry, {upsert: true}, (err, entry) => {
        if (err) {
            logger.error(err);
            res.redirect("/entry/?warning=entry_save");
            return;
        }
        if (req.body.entry_type === "act2") {
            schedule.push("entry_act2_tweet", true, moment().add(3, "minutes").toDate(), entryHelper.tweetAct2);
        }
        res.redirect("/entry/");
    });

});


router.post("/cancel", account.isAuthenticated, validator.entry, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/entry/?warning=validate");
        return;
    }

    const entry = new Entry.schema({
        _id: req.user._id
    });
    entry.remove((err, entry) => {
        if (err) {
            logger.error(err);
            res.redirect("/entry/?warning=entry_delete");
            return;
        }
        res.redirect("/entry/");
    });

});


module.exports = router;
