"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const entryHelper = require(rootDir + "/src/entryHelper");
const reserveHelper = require(rootDir + "/src/reserveHelper");


//router.get("/",
//    account.isAuthenticated,
//    routeHelper.check,
//    entryHelper.get,
//    (req, res) => {
//        res.viewParam.user = req.user;
//        res.viewParam.registered = req.user.sex && req.user.skype_id;
//        res.viewParam.twitter_safe = entryHelper.isSafeTwitter(req.user);
//        res.viewParam.isReady = res.viewParam.registered
//            && res.viewParam.twitter_safe
//            && entryHelper.isEntryTime()
//        ;
//
//        if (res.viewParam.matched && res.viewParam.matched.length === 1) {
//            res.render("entry_fail", res.viewParam);
//        } else if (res.viewParam.matched) {
//            res.render("entry_success", res.viewParam);
//        } else if (res.viewParam.entry) {
//            res.render("entry_now", res.viewParam);
//        } else {
//            res.render("entry_ready", res.viewParam);
//        }
//    });

router.get("/:reserve_id",
    reserveHelper.get,
    routeHelper.check,
    (req, res) => {
        res.viewParam.user = req.user;
        res.render("reserve", res.viewParam);

});

router.post("/:reserve_id/entry", account.isAuthenticated, validator.reserve.entry, (req, res) => {
    let redirect = "/reserve/"+req.params.reserve_id;
    if (validator.isError(req)) {
        res.redirect(redirect+"?warning=validate");
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

    //const entry = new Entry.schema({
    //    _id: req.user._id
    //});
    //Entry.schema.findOneAndUpdate({_id: entry.id}, entry, {upsert: true}, (err, entry) => {
    //    if (err) {
    //        logger.error(err);
    //        res.redirect("/entry/?warning=entry_save");
    //        return;
    //    }
    //    res.redirect("/entry/");
    //});

    res.redirect(redirect);
});


router.post("/cancel", account.isAuthenticated, (req, res) => {

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
