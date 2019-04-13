"use strict";

const rootDir = require("app-root-path");
const C = require(rootDir+"/src/const");
const logger = require(rootDir + "/src/log4js");
const twitter = require(rootDir + "/src/twitter");
const User = require("../src/model/user");
const Entry = require(rootDir + "/src/model/entry");
const Match = require(rootDir + "/src/model/match");


const numberConstraint = {
    act2: [2]
    ,act3_7: [3,4,5,6,7]
}

const actSexConstraint = {
    2: {"f": 2, "m": 2}
    ,3: {"f": 3, "m": 3}
    ,4: {"f": 3, "m": 3} // 3:1 ~ 1:3
    ,5: {"f": 3, "m": 3 } // 3:2 ~ 2:3
    ,6: {"f": 4, "m": 4 } // 4:2 ~ 2:4
    ,7: {"f": 4, "m": 4 } // 4:3 ~ 3:4
}

module.exports.shuffle = (list) => {
    let copied = list.slice();
    for (let i = copied.length - 1; i > 0; i--){
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
        let user = list[i];
        Entry.schema.deleteOne({_id: user._id}, (err, entry) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });
        let match = new Match.schema({
            _id: user._id
            ,ids: ids
        });
        Match.schema.findOneAndUpdate({ "_id" : match._id}, match, { upsert: true, setDefaultsOnInsert: true }, (err, res) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });

        if (user.push.match === true) {
            let text = "マッチングしました。結果を確認してください。\n"
                +C.BASE_URL;
            twitter.sendDm(user, text);
        }
    }
}

module.exports.findMatch = (entries, n, sexConstraint) => {
    let list = [];
    let ngList = [];
    let sex = Object.assign({}, sexConstraint);

    logger.debug("find "+n);

    for (let i = 0; i < entries.length; i++) {
        let user = entries[i]._id;

        if (!this.checkNg(list, ngList, user)) continue;

        // 性別上限チェック
        if (sex[user.sex] === 0) continue;
        sex[user.sex]--;

        list.push(user);
        ngList = ngList.concat(user.ng_list);
        if (list.length === n) {
            return list;
        }
    }
    return [];
}

module.exports.match = async (type) => {
    logger.debug(type+" match start");
    let entries;
    let filter = {
        type: type
    };
    try {
        entries = await Entry.schema.find(filter).populate("_id").exec();
    } catch (err) {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }
    }

    if (entries.length > 0) {
        logger.info(type+" matching num: "+entries.length);
    }

    while (1) {
        //let shuffleNumbers = this.shuffle(numbers); // 人数候補
        let shuffleNumbers = numberConstraint[type].slice(); // コピー
        let failCount = shuffleNumbers.length;
        
        while (shuffleNumbers.length > 0) {
            let number = shuffleNumbers.pop();
            let list = this.findMatch(entries, number, actSexConstraint[number]);
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

    logger.debug("match end");
}

module.exports.matchEvent = async (event) => {
    logger.debug("even match start");
    let scenario = event.scenario;
    let entries;
    let filter = {
        type: "event"
    };
    try {
        entries = await Entry.schema.find(filter).populate("_id").exec();
    } catch (err) {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }
    }

    if (entries.length > 0) {
        logger.info(scenario.title+" matching num: "+entries.length);
    }

    let number = scenario.chara.length;
    let sexConstraint = {"f": 0, "m": 0};
    for (let c of scenario.chara) {
        sexConstraint[c.sex]++;
    }

    while (1) {
        let list = this.findMatch(entries, number, sexConstraint);
        if (list.length === 0) { // マッチング失敗
            break;
        } else {
            entries = entries.filter((n) => list.indexOf(n._id) === -1);
            this.matched(list);
        }
    }

    logger.debug("event match end");
}
