"use strict";

const rootDir = require("app-root-path");

const logger = require(rootDir + "/src/log4js");
const User = require(rootDir + "/src/model/user");
const Entry = require(rootDir + "/src/model/entry");
const Match = require(rootDir + "/src/model/match");


module.exports.getMatch = async (req, res, next) => {
    try {
        let match = await Match.findOne({ _id: req.user.id }).populate("ids").exec();
        if (match) {
            res.viewParam.matched = match.ids;
        }
    } catch (err) {
        logger.error(err);
        throw err;
    }

    next();
}

module.exports.getEntry = async (req, res, next) => {
    try {
        let entry = await Entry.findOne({ _id: req.user.id }).populate("_id").exec();
        res.viewParam.entry = entry;
    } catch (err) {
        logger.error(err);
        throw err;
    }

    next();
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
