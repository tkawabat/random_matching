"use strict";

const rootDir = require("app-root-path");
const logger = require(rootDir + "/src/log4js");
const User = require("../src/model/user");
const Entry = require(rootDir + "/src/model/entry");
const Match = require(rootDir + "/src/model/match");


const actSexConstraint = {
    2: 2  
    ,3: 3
    ,4: 3 // 3:1 ~ 1:3
    ,5: 3 // 3:2 ~ 2:3
    ,6: 4 // 4:2 ~ 2:4
    ,7: 4 // 4:3 ~ 3:4
}

const shuffle = (list) => {
    for(var i = list.length - 1; i > 0; i--){
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = list[i];
        list[i] = list[r];
        list[r] = tmp;
    }
    return list;
}

module.exports.matched = (list) => {
    let ids = [];
    let log = [];
    for (let i = 0; i < list.length; i++) {
        ids.push(list[i]._id);
        log.push(list[i].sex + ":" + list[i].twitter_name);
    }

    logger.info("match: "+log.join(", "));

    for (let i = 0; i < list.length; i++) {
        Entry.deleteOne({_id: list[i]._id}, (err, entry) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });
        let match = new Match({
            _id: list[i]._id
            ,ids: ids
        });
        Match.findOneAndUpdate({ "_id" : match._id}, match, { upsert: true, setDefaultsOnInsert: true }, (err, res) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });
    }
}

module.exports.findMatch = (entries, n) => {
    let list = [];
    let m = actSexConstraint[n];
    let f = actSexConstraint[n];
    for (let i = 0; i < entries.length; i++) {
        let user = entries[i]._id;
        if (user.sex === "m") {
            if (m === 0) {
                continue;
            }
            m--;
        } else if (user.sex === "f") {
            if (f === 0) { // 女性上限チェック
                continue;
            }
            f--;
        }

        list.push(user);
        if (list.length === n) {
            return list;
        }
    }
    return [];
}

module.exports.matchAct = () => {
    logger.info("match start");
    Entry.find().populate("_id").exec((err, entries) => {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }

        logger.info("matching num: "+entries.length);

        while (1) {
            let numbers = shuffle([3,4,5,6]); // 人数候補
            let failCount = numbers.length;
            while (numbers.length > 0) {
                let list = this.findMatch(entries, numbers.pop());
                if (list.length === 0) {
                    // マッチング失敗
                    failCount--;
                } else {
                    entries = entries.filter((n) => list.indexOf(n._id) === -1);
                    this.matched(list);
                }
            }
            if (failCount === 0) break;
        }

        for (let i = 0; i < entries.length; i++) {
            this.matched([entries[i]._id]); // 一人
        }

        logger.info("match end");
    });
}


//module.exports = {
//    matchAct: matchAct
//    ,matchActN: matchActN
//    ,matched: matched
//};
