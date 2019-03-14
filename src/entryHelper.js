"use strict";

const rootDir = require("app-root-path");

const logger = require(rootDir + "/src/log4js");
const User = require(rootDir + "/src/model/user");
const ActEntry = require(rootDir + "/src/model/actEntry");
const Match = require(rootDir + "/src/model/match");


const getMatch = (req, res, next) => {
    Match.findOne({ _id: req.user.id }, (err, match) => {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }

        if (!match) {
            next();
            return;
        }

        User.find({ _id: { $in: match.ids}}, (err, users) => {
            if (err) {
                logger.error(err);
                throw err;
                return;
            }
            res.viewParam.matched = users;
            next();
        });

    });
}

const getEntry = (req, res, next) => {
    ActEntry.findOne({ _id: req.user.id }, (err, entry) => {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }

        res.viewParam.entry = entry;
        next();
    });
}

const isSafeTwitter = (user) => {
    if (!user.twitter_created_at) {
        return false;
    }
    console.log(user.twitter_created_at);
    console.log(user.twitter_created_at.getTime());
    let diff = new Date().getTime() - user.twitter_created_at.getTime();
    if (diff / 1000 < 60 * 60 * 24 * 180) {
        return false;
    }

    return true;
}


module.exports = {
    getMatch: getMatch
    ,getEntry: getEntry
    ,isSafeTwitter: isSafeTwitter
};
