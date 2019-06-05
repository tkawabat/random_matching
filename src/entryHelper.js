"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir + "/src/const");
const logger = require(rootDir + "/src/log4js");
const cache = require(rootDir + "/src/cache");
const twitter = require(rootDir + "/src/twitter");
const schedule = require(rootDir + "/src/schedule");
const matcher = require(rootDir + "/src/matcher");
const User = require(rootDir + "/src/model/user");
const Entry = require(rootDir + "/src/model/entry");
const Match = require(rootDir + "/src/model/match");


module.exports.get = async (req, res, next) => {
    let p = [];
    p.push(Match.model.get(req.user)
        .catch((err) => {
            logger.error(err);
            next(err);
        })
        .then((match) => {
            res.viewParam.match = match;
            if (match) {
                res.viewParam.match_expiration = moment(match.created_at).add(C.MATCH_EXPIRE_SECONDS, "seconds").format("HH:mm");
            }
        })
    );

    p.push(Entry.schema.findOne({ _id: req.user._id }).populate("_id").exec()
        .catch((err) => {
            logger.error(err);
            next(err);
        })
        .then((entry) => {
            res.viewParam.entry = entry;
            if (entry) {
                res.viewParam.entry_expiration = moment(entry.created_at).add(C.ENTRY_EXPIRE_SECONDS, "seconds").format("HH:mm");
            }
        })
    );

    p.push(Entry.model.countByType()
        .then((count) => {
            res.viewParam.entryCount = count;
        })
    );

    return Promise.all(p).then(() => next());
}

module.exports.pushScheduleMatch = (entry) => {
    let type = entry.type[0];
    if (type !== "act3_7") return;
    if (schedule.jobs["match_2_act3_7"]) return;

    let time1 = moment().add(15, "minutes");
    let time2 = moment().add(30, "minutes");

    schedule.push("match_1_act3_7", true, time1.toDate(), async () => {
        matcher.match("act3_7");
    });
    schedule.push("match_2_act3_7", true, time2.toDate(), async () => {
        matcher.match("act3_7");
    });

    let text = "3~7人劇マッチングが開始しました。\n"
        +time1.format("HH:mm")+", "+time2.format("HH:mm")+"にマッチングします。是非エントリーを！\n";
    if (entry.tags && entry.tags.length > 0) {
        text += "タグ: "+entry.tags.join(", ")+"\n";
    }
    text += C.BASE_URL;
    twitter.tweet(text);
}

module.exports.pushScheduleTweet = (entry, event) => {
    let type = entry.type[0];

    let text;
    let time = moment().add(3, "minutes").toDate();

    if (type === "act2") {
        text = "サシ劇マッチングで待っている方がいます。すぐに劇をしたい方は是非エントリーを！";
    } else if (type === "event" && event !== null) {
        text = event.title+"で待っている方がいます。是非エントリーを！";
    } else {
        return;
    }

    schedule.push("entry_tweet_"+type, true, time, async () => {
        let isExist = await Entry.model.isEntryExist(type);
        if (!isExist) return;
        text +=  "("+moment().format("HH:mm")+")\n";
        if (entry.tags && entry.tags.length > 0) {
            text += "タグ: "+entry.tags.join(", ")+"\n";
        }
        text += C.BASE_URL;
        twitter.tweet(text);
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

module.exports.isAct3_7EntryTime = () => {
    return true;
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
