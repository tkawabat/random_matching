"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const C = require(rootDir + "/src/const");
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const tags = require(rootDir + "/src/tags");
const routeHelper = require(rootDir + "/src/routeHelper");
const entryHelper = require(rootDir + "/src/entryHelper");
const Entry = require(rootDir + "/src/model/entry");
const User = require(rootDir + "/src/model/user");


router.get("/",
    account.isAuthenticated,
    routeHelper.check,
    entryHelper.get,
    (req, res, next) => ( async () => {
        res.viewParam.registered = req.user.sex && req.user.skype_id;
        res.viewParam.twitter_safe = User.model.isSafeTwitter(req.user);
        let ready = User.model.isReady(req.user);
        res.viewParam.isReady = {
            act2: ready
            ,act3_7: ready && entryHelper.isAct3_7EntryTime()
            ,event: ready
        };

        if (res.viewParam.match && res.viewParam.match.matched.length === 1) {
            res.render("entry/fail", res.viewParam);
        } else if (res.viewParam.match) {
            res.render("entry/success", res.viewParam);
        } else if (res.viewParam.entry) {
            res.render("entry/now", res.viewParam);
        } else {
            res.render("entry/index", res.viewParam);
        }
    })().catch(next)
);

router.post("/"
    ,account.isAuthenticated
    ,validator.entry.post
    ,(req, res, next) => ( async () => {
        if (validator.isError(req)) {
            res.redirect("/entry/?warning=validate");
            return;
        }

        if (!User.model.isReady(req.user)) {
            res.redirect("/entry/?warning=invalid_user");
            return;
        }

        let entry = {
            _id: req.user._id
            , type: [req.body.entry_type]
            , tags: tags.parse(req.body.tags)
        };
        let opt = C.MONGO_OPT;
        opt.new = true;
        opt.upsert = true;
        entry = await Entry.schema.findOneAndUpdate({"_id": entry._id}, entry, opt).exec();

        entryHelper.tweet(entry, res.viewParam.event);

        logger.info("entry "+req.body.entry_type+" "+req.user.twitter_id);
        res.redirect("/entry/");
    })().catch(next)
);


router.post("/cancel", account.isAuthenticated, validator.entry.cancel, (req, res) => {
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
