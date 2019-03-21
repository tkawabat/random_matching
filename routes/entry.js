"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const entryHelper = require(rootDir + "/src/entryHelper");
const Entry = require(rootDir + "/src/model/entry");


router.get("/",
    account.isAuthenticated,
    routeHelper.check,
    entryHelper.getMatch,
    entryHelper.getEntry,
    (req, res) => {
        res.viewParam.user = req.user;
        res.viewParam.registered = req.user.sex && req.user.skype_id;
        res.viewParam.twitter_safe = entryHelper.isSafeTwitter(req.user);
        res.viewParam.isReady = res.viewParam.registered && res.viewParam.twitter_safe;
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

    const entry = new Entry({
        _id: req.user._id
    });
    Entry.findOneAndUpdate({_id: entry.id}, entry, {upsert: true}, (err, entry) => {
        if (err) {
            logger.error(err);
            res.redirect("/entry/?warning=entry_save");
            return;
        }
        res.redirect("/entry/");
    });

});


router.post("/cancel", account.isAuthenticated, validator.entry, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/entry/?warning=validate");
        return;
    }

    const entry = new Entry({
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
