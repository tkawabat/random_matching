"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const C = require(rootDir + "/src/const");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const entryHelper = require(rootDir + "/src/entryHelper");
const reserveHelper = require(rootDir + "/src/reserveHelper");
const User = require(rootDir + "/src/model/user");
const Reserve = require(rootDir + "/src/model/reserve");


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

        res.viewParam.isReady = req.user && User.model.isReady(req.user);
        for (let c of res.viewParam.reserve.chara) { // エントリー済み
            if (c.user && req.user && c.user._id === req.user._id) {
                res.viewParam.isReady = false;
                break;
            }
        }

        res.viewParam.url = C.BASE_URL+"/reserve/"+req.params.reserve_id;
        res.render("reserve/detail", res.viewParam);
});

router.get("/create", account.isAuthenticated, (req, res) => {
    // TODO 個数チェック

    res.render("reserve/create", res.viewParam);
});

router.get("/:reserve_id/edit", account.isAuthenticated, validator.reserve.entry, (req, res) => {
});

router.post("/:reserve_id/entry", account.isAuthenticated, validator.reserve.entry, (req, res) => {
    let redirect = "/reserve/"+req.params.reserve_id;
    if (validator.isError(req)) {
        res.redirect(redirect+"?warning=validate");
        return;
    }

    if (!User.model.isReady(req.user)) {
        res.redirect(redirect+"?warning=invalid_user");
        return;
    }

    Reserve.model.entry(req.user, req.body.chara).then((reserve) => {
        let text = "reserve entry: "
            +req.user.twitter_id+" "+req.params.reserve_id;
        if (!reserve) {
            logger.error(text);
            res.redirect(redirect+"?warning=reserve_entry");
        } else {
            logger.info(text);
            res.redirect(redirect);
        }
    });
});

router.post("/:reserve_id/entry", account.isAuthenticated, validator.reserve.entry, (req, res) => {
    let redirect = "/reserve/"+req.params.reserve_id;
    if (validator.isError(req)) {
        res.redirect(redirect+"?warning=validate");
        return;
    }

    if (!User.model.isReady(req.user)) {
        res.redirect(redirect+"?warning=invalid_user");
        return;
    }

    Reserve.model.entry(req.user, req.body.chara).then((reserve) => {
        let text = "reserve entry: "
            +req.user.twitter_id+" "+req.params.reserve_id;
        if (!reserve) {
            logger.error(text);
            res.redirect(redirect+"?warning=reserve_entry");
        } else {
            logger.info(text);
            res.redirect(redirect);
        }
    });
});

router.post("/:reserve_id/entry_guest", account.isAuthenticated, validator.reserve.entryGuest, (req, res) => {
    let redirect = "/reserve/"+req.params.reserve_id;
    if (validator.isError(req)) {
        res.redirect(redirect+"?warning=validate");
        return;
    }

    Reserve.model.entryGuest(req.user, req.body.chara, req.body.name).then((reserve) => {
        let text = "reserve entry guest: " + req.body.name;
        if (!reserve) {
            logger.error(text);
            res.redirect(redirect+"?warning=reserve_entry");
        } else {
            logger.info(text);
            res.redirect(redirect);
        }
    });
});

router.post("/:reserve_id/entry/cancel", account.isAuthenticated, validator.reserve.cancelEntry, (req, res) => {
    let redirect = "/reserve/"+req.params.reserve_id;
    if (validator.isError(req)) {
        res.redirect(redirect+"?warning=validate");
        return;
    }

    let text;

    let fn = (reserve) => {
        if (!reserve) {
            logger.error(text);
            res.redirect(redirect+"?warning=reserve_entry_cancel");
        } else {
            logger.info(text);
            res.redirect(redirect);
        }
    };

    if (req.body.owner) {
        text = "reserve entry cancel by owner: "
            +req.user.twitter_id+" "+req.params.reserve_id;
        Reserve.model.cancelEntryByOwner(req.user, req.body.chara).then(fn);
    } else {
        text = "reserve entry cancel: "
            +req.user.twitter_id+" "+req.params.reserve_id;
        Reserve.model.cancelEntry(req.user, req.body.chara).then(fn);
    }
});


module.exports = router;