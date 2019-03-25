"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const logger = require(rootDir + "/src/log4js");
const cache = require(rootDir + "/src/cache");
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
                res.viewParam.matched = match.ids;
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
        }

        n--;
        if (n === 0) {
            next();
        }
    });
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

module.exports.isEntryTime = () => {
    let hour = moment().hour();
    let minutes = moment().minutes();
    if (hour === 20 && minutes > 30) {
        return true;
    } if (hour >= 22) {
        return true;
    }
}
