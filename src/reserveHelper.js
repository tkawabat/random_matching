"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir + "/src/const");
const logger = require(rootDir + "/src/log4js");
const cache = require(rootDir + "/src/cache");
const twitter = require(rootDir + "/src/twitter");
const User = require(rootDir + "/src/model/user");
const Scenario = require(rootDir + "/src/model/scenario");
const Reserve = require(rootDir + "/src/model/reserve");


module.exports.get = (req, res, next) => {
    Reserve.schema.findOne({ _id: req.params.reserve_id })
        .populate("owner").populate("scenario").populate("chara.user")
        .exec((err, reserve) => {
        if (err) {
            logger.error(err);
            next(err);
            return;
        }

        res.viewParam.reserve = reserve;
        next();
    });
}
