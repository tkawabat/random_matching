"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir + "/src/const");
const logger = require(rootDir + "/src/log4js");
const cache = require(rootDir + "/src/cache");
const twitter = require(rootDir + "/src/twitter");
const User = require(rootDir + "/src/model/user");
const Entry = require(rootDir + "/src/model/entry");
const Match = require(rootDir + "/src/model/match");


module.exports.get = (req, res, next) => {
    let n = 2;

    Match.schema.findOne({ _id: req.user.id }).populate("ids").exec((err, match) => {
        if (err) {
            logger.error(err);
            throw err;
        } else {
            if (match) {
                res.viewParam.match = match;
                res.viewParam.match_expiration = moment(match.created_at).add(C.MATCH_EXPIRE_SECONDS, "seconds").format("kk:mm");
            }
        }

        n--;
        if (n === 0) {
            next();
        }
    });

    Entry.schema.findOne({ _id: req.user.id }).populate("_id").exec((err, entry) => {
        if (err) {
            logger.error(err);
            throw err;
            next();
        } else {
            res.viewParam.entry = entry;
            if (entry) {
                res.viewParam.entry_expiration = moment(entry.created_at).add(30, "minutes").format("kk:mm");
            }
        }

        n--;
        if (n === 0) {
            next();
        }
    });
}

module.exports.tweet = async (type, event) => {
    let text;
    if (type === "act2") {
        text = "サシ劇マッチングで待っている方がいます。すぐに劇をしたい方は是非マッチングを！";
    } else if (type === "event") {
        text = event.title+"で待っている方がいます。ご興味ある方は是非マッチングを！";
    } else {
        return;
    }
    let time = moment().format("kk:mm");
    text +=  "("+time+")\n"
        + "https://random-matching.tokyo";

    let isExist = await Entry.model.isEntryExist(type);
    if (!isExist) return;

    twitter.tweet(text);
}

module.exports.isSafeTwitter = (user) => {
    if (!user.twitter_created_at) {
        return false;
    }
    let diff = new Date().getTime() - user.twitter_created_at.getTime();
    if (diff / 1000 < 60 * 60 * 24 * 180) {
        return false;
    }

    return true;
}

module.exports.isAct3_7EntryTime = () => {
    let hour = moment().hour();
    let minutes = moment().minutes();
    if (hour === 20 && minutes > 30) {
        return true;
    }
    if (hour === 21 && minutes > 30) {
        return true;
    }

    return false;
}
