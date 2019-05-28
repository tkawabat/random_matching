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
const User = require(rootDir + "/src/model/user");


router.get("/",
    account.isAuthenticated,
    routeHelper.check,
    entryHelper.get,
    (req, res) => {
        res.viewParam.registered = req.user.sex && req.user.skype_id;
        res.viewParam.twitter_safe = User.model.isSafeTwitter(req.user);
        let ready = User.model.isReady(req.user);
        res.viewParam.isReady = {
            act2: ready
            ,act3_7: ready && entryHelper.isAct3_7EntryTime()
            ,event: ready
        };

        if (res.viewParam.match && res.viewParam.match.ids.length === 1) {
            res.render("entry/fail", res.viewParam);
        } else if (res.viewParam.match) {
            res.render("entry/success", res.viewParam);
        } else if (res.viewParam.entry) {
            res.render("entry/now", res.viewParam);
        } else {
            res.render("entry/index", res.viewParam);
        }
    });

router.post("/", account.isAuthenticated, validator.entry, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/entry/?warning=validate");
        return;
    }

    if (!User.model.isReady(req.user)) {
        res.redirect("/entry/?warning=invalid_user");
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
        if (req.body.entry_type === "act2" || req.body.entry_type === "event") {
            let t = moment().add(3, "minutes").toDate();
            schedule.push("entry_tweet", true, t, () => {
                entryHelper.tweet(req.body.entry_type, res.viewParam.event);
            });
        }
        logger.info("entry "+req.body.entry_type+" "+req.user.twitter_id);
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
        logger.info("cancel entry "+req.user.twitter_id);
        res.redirect("/entry/");
    });

});


module.exports = router;
