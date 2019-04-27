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


module.exports.get = async (req, res, next) => {
    return Reserve.schema.findOne({ _id: req.params.reserve_id })
        .populate("owner").populate("scenario").populate("chara.user")
        .lean()
        .exec()
        .catch((err) => {
            logger.error(err);
            next(err);
        })
        .then((reserve) => {
            // guest対応
            for (let i = 0; i < reserve.chara.length; i++) {
                let c = reserve.chara[i];
                if (!c.guest) continue;
                c.user = {
                    _id: c.guest
                    ,twitter_name: c.guest
                    ,skype_id: ""
                    ,image_url_https: C.IMAGE_TWITTER_DEFAULT
                };
            }

            res.viewParam.reserve = reserve;
            next();
        });
}
