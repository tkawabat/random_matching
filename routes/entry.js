"use strict";

const rootDir = require("app-root-path");
const express = require("express");

const router = express.Router();
const account = require(rootDir + "/src/account");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const ActEntry = require(rootDir + "/src/model/actEntry");


router.get("/", account.isAuthenticated, routeHelper.check, (req, res) => {
    ActEntry.findOne({ _id: req.user.id }, (err, entry) => {
        if (err) {
            throw err;
            return;
        }
        res.viewParam.user = req.user;
        res.viewParam.entry_status = entry ? "entried" : "null";
        res.render("entry", res.viewParam);
    });
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
            console.log(err);
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
            console.log(err);
            res.redirect("/entry/?warning=entry_delete");
            return;
        }
        res.redirect("/entry/");
    });

});


module.exports = router;
