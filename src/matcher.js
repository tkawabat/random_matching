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

module.exports.shuffle = (list) => {
    let copied = list.slice();
    for(let i = copied.length - 1; i > 0; i--){
        let r = Math.floor(Math.random() * (i + 1));
        let tmp = copied[i];
        copied[i] = copied[r];
        copied[r] = tmp;
    }
    return copied;
}

module.exports.checkNg = (list, ngList, user) => {
    if (ngList.includes(user.twitter_id)) return false;
    for (let i = 0; i < list.length; i++) {
        if (user.ng_list.includes(list[i].twitter_id)) return false;
    }
    return true;
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
        Entry.schema.deleteOne({_id: list[i]._id}, (err, entry) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });
        let match = new Match.schema({
            _id: list[i]._id
            ,ids: ids
        });
        Match.schema.findOneAndUpdate({ "_id" : match._id}, match, { upsert: true, setDefaultsOnInsert: true }, (err, res) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });
    }
}

module.exports.findMatch = (entries, n) => {
    let list = [];
    let ngList = [];
    let m = actSexConstraint[n];
    let f = actSexConstraint[n];

    logger.info("find "+n);

    for (let i = 0; i < entries.length; i++) {
        let user = entries[i]._id;

        if (!this.checkNg(list, ngList, user)) continue;
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
        ngList = ngList.concat(user.ng_list);
        if (list.length === n) {
            return list;
        }
    }
    return [];
}

module.exports.matchAct = async (numbers) => {
    logger.info("match start");
    let entries;
    try {
        entries = await Entry.schema.find().populate("_id").exec();
    } catch (err) {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }
    }

    logger.info("matching num: "+entries.length);

    while (1) {
        //let shuffleNumbers = this.shuffle(numbers); // 人数候補
        let shuffleNumbers = numbers.slice(); // コピー
        let failCount = shuffleNumbers.length;
        while (shuffleNumbers.length > 0) {
            let list = this.findMatch(entries, shuffleNumbers.pop());
            if (list.length === 0) { // マッチング失敗
                failCount--;
            } else {
                entries = entries.filter((n) => list.indexOf(n._id) === -1);
                this.matched(list);
            }
        }
        if (failCount === 0) break;
    }

    //for (let i = 0; i < entries.length; i++) {
    //    this.matched([entries[i]._id]); // 一人
    //}

    logger.info("match end");
}
