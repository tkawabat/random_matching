"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const express = require("express");

const router = express.Router();
const logger = require(rootDir + "/src/log4js");
const account = require(rootDir + "/src/account");
const C = require(rootDir + "/src/const");
const validator = require(rootDir + "/src/validator");
const routeHelper = require(rootDir + "/src/routeHelper");
const reserveHelper = require(rootDir + "/src/reserveHelper");
const User = require(rootDir + "/src/model/user");
const Reserve = require(rootDir + "/src/model/reserve");


router.get("/",
    routeHelper.check,
    (req, res, next) => ( async () => {
        let p = [];
        p.push(Reserve.model.get({ public: true })
            .then((ret) => {
                res.viewParam.reserveList = ret;
            })
        );
        if (req.user) {
            p.push(Reserve.model.get({ owner: req.user._id })
                .then((ret) => {
                    res.viewParam.myReserveList = ret;
                })
            );
        }

        await Promise.all(p);
        res.render("reserve/index", res.viewParam);
    })().catch(next)
);

router.get("/create",
    account.isAuthenticated,
    routeHelper.check,
    (req, res, next) => ( async () => {
        if (await Reserve.model.isLimited(req.user)) {
            res.redirect("/reserve/?warning=reserve_limit");
            return;
        }

        let reserve = {
            _id: null
            ,scenario_title: null
            ,author: null
            ,url: null
            ,agree_url: null
            ,minutes: null
            ,place: null
            ,public: true
            ,chara: [
                { name: "", sex: "" }
            ]
        };

        res.viewParam.reserve = reserve;
        res.render("reserve/create", res.viewParam);
    })().catch(next)
);

router.get("/create/:reserve_id",
    account.isAuthenticated,
    routeHelper.check,
    (req, res, next) => ( async () => {
        let reserve = await Reserve.schema.findOne({"_id": req.params.reserve_id}).lean();
        if (reserve.owner !== req.user._id) {
            next();
            return;
        }

        res.viewParam.reserve = reserve;
        res.render("reserve/create", res.viewParam);
    })().catch(next)
);

router.post("/create",
    account.isAuthenticated,
    validator.reserve.create,
    (req, res, next) => ( async () => {
        if (validator.isError(req)) {
            res.viewParam.reserve = validator.sanitizeInvalid(req);
            if (!res.viewParam.reserve.chara) {
                res.viewParam.reserve.chara = [
                    { name: "", sex: ""}
                ];
            }
            res.viewParam.alert_warning = res.viewParam.alert_warning.concat(validator.getErrorMessages(req));
            res.render("reserve/create", res.viewParam);
            return;
        }

        if (!req.body._id && await Reserve.model.isLimited(req.user)) {
        console.log(req.body._id);
            res.redirect("/reserve/?warning=reserve_limit");
            return;
        }

        let chara = [];
        for (let i = 0; i < req.body.chara_list.length; i++) {
            chara.push({ name: req.body.chara_list[i], sex: req.body.sex_list[i] });
        }
        let reserve = JSON.parse(JSON.stringify(req.body));
        reserve.start_at = moment(reserve.start_at).toDate();
        delete reserve.chara_list;
        delete reserve.sex_list;
        reserve.chara = chara;
        reserve.public = reserve.public && reserve.public === "on";

        reserve = await Reserve.model.update(reserve, req.user);
        if (reserve) {
            res.redirect("/reserve/detail/"+reserve._id);
        } else {
            let redirect = "/reserve/create/"+(req.body._id ? req.body._id : "");
            res.redirect(redirect+"?warning=reserve_create");
        }
    })().catch(next)
);

router.get("/detail/:reserve_id",
    reserveHelper.get,
    routeHelper.check,
    (req, res, next) => ( async () => {
        res.viewParam.isReady = req.user && User.model.isReady(req.user);
        for (let c of res.viewParam.reserve.chara) { // エントリー済み
            if (c.user && req.user && c.user._id === req.user._id) {
                res.viewParam.isReady = false;
                break;
            }
        }

        res.viewParam.url = C.BASE_URL+"/reserve/"+req.params.reserve_id;

        if (reserveHelper.isAfter(res.viewParam.reserve)) {
            res.render("reserve/detail_after", res.viewParam);
        } else {
            res.render("reserve/detail", res.viewParam);
        }
    })().catch(next)
);

router.post("/entry/:reserve_id", account.isAuthenticated, validator.reserve.entry, (req, res) => {
    let redirect = "/reserve/detail/"+req.params.reserve_id;
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

router.post("/entry/:reserve_id", account.isAuthenticated, validator.reserve.entry, (req, res) => {
    let redirect = "/reserve/detail/"+req.params.reserve_id;
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

router.post("/entry_guest/:reserve_id", account.isAuthenticated, validator.reserve.entryGuest, (req, res) => {
    let redirect = "/reserve/detail/"+req.params.reserve_id;
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

router.post("/entry_cancel/:reserve_id", account.isAuthenticated, validator.reserve.cancelEntry, (req, res) => {
    let redirect = "/reserve/detail/"+req.params.reserve_id;
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

router.post("/mvp/:reserve_id"
    ,account.isAuthenticated
    ,validator.reserve.mvp
    ,(req, res, next) => ( async () => {
        let redirect = "/reserve/detail/"+req.params.reserve_id;
        if (validator.isError(req)) {
            res.redirect(redirect+"?warning=validate");
            return;
        }

        Reserve.model.mvp(req.user, req.body.chara).then((reserve) => {
            let text = "reserve mvp: "
                +req.user.twitter_id+" "+req.params.reserve_id;
            if (!reserve) {
                logger.error(text);
                res.redirect(redirect+"?warning=reserve_mvp");
            } else {
                logger.info(text);
                res.redirect(redirect);
            }
        });
    })().catch(next)
);


module.exports = router;
