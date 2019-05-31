"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir + "/src/const");
const logger = require(rootDir + "/src/log4js");
const cache = require(rootDir + "/src/cache");
const twitter = require(rootDir + "/src/twitter");
const routeHelper = require(rootDir + "/src/routeHelper");
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
            if (!reserve) {
                routeHelper.Error404(req, res, next);
                return;
            }

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

module.exports.isAfter = (reserve) => {
    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").unix();
    let start = moment(reserve.start_at).unix();
    return time > start;
}

module.exports.tweetCreated = async (id) => {
    let reserve = await Reserve.schema.findOne({_id: id, public: true}).lean();
    if (!reserve) {
        logger.info("skip tweet reserve created "+id);
        return;
    }

    let time = moment(reserve.start_at).format("M/D HH:mm");
    let remains_text = [];
    let remains = {"m": 0, "f": 0, "o": 0}
    for (let c of reserve.chara) {
        if (!c.user && !c.guest) remains[c.sex]++;
    }
    for (let sex of Object.keys(remains)) {
        if (remains[sex] === 0) continue;
        remains_text.push(C.SEX_ICON[sex]+remains[sex]);
    }
    remains_text = remains_text.length === 0 ? ""
        : "空き："+remains_text.join(" ")+"\n";

    let text = "新しい募集劇が公開されました。\n"
        +time+"~ 『"+reserve.scenario_title+"』\n"
        +remains_text
        +C.BASE_URL+"/reserve/detail/"+reserve._id;
    twitter.tweet(text);
}
