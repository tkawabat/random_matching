"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const entryHelper = require(rootDir + "/src/entryHelper");
const ActEntry = require(rootDir + "/src/model/actEntry");


router.get("/",
    account.isAuthenticated,
    routeHelper.check,
    entryHelper.getMatch,
    entryHelper.getEntry,
    (req, res) => {
        res.viewParam.user = req.user;
        let status = "null";
        if (res.viewParam.match) {
            status = "matched";
        } else if (res.viewParam.entry) {
            status = "entried";
        }
        res.viewParam.entry_status = status;
        res.render("entry", res.viewParam);
    });

router.post("/", account.isAuthenticated, validator.actEntry, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/entry/?warning=validate");
        return;
    }

    const entry = new ActEntry({
        _id: req.user._id
    });
    ActEntry.findOneAndUpdate({_id: entry.id}, entry, {upsert: true}, (err, entry) => {
        if (err) {
            logger.error(err);
            res.redirect("/entry/?warning=entry_save");
            return;
        }
        res.redirect("/entry/");
    });

});


router.post("/cancel", account.isAuthenticated, validator.actEntry, (req, res) => {
    if (validator.isError(req)) {
        res.redirect("/entry/?warning=validate");
        return;
    }

    const entry = new ActEntry({
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
