"use strict";

const rootDir = require("app-root-path");
const C = require(rootDir+"/src/const");
const logger = require(rootDir + "/src/log4js");
const twitter = require(rootDir + "/src/twitter");
const db= require(rootDir + "/src/mongodb");
const User = require(rootDir + "/src/model/user");
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
    for (let entry of list) {
        if (user.ng_list.includes(entry._id.twitter_id)) return false;
    }
    return true;
}

module.exports.matched = async (matched, type) => {
    let entry;
    let p = [];
    let log = [];
    let list = [];
    let opt = C.MONGO_OPT;
    opt.new = true;
    opt.upsert = true;

    for (entry of matched) {
        log.push(entry._id.sex + ":" + entry._id.twitter_id);
        list.push({
            user: entry._id._id
            , tags: entry.tags
        });

        p.push(Entry.schema.deleteOne({_id: entry._id._id}).exec()
            .catch((err) => { logger.error(err); })
        );

        if (entry._id.push.match === true) {
            let text = "マッチングしました。結果を確認してください。\n"
                +C.BASE_URL;
            twitter.sendDm(entry._id, text);
        }
    }

    let match = new Match.schema({
        _id: new db.Types.ObjectId
        , type: type
        , matched: list
    });
    opt.setDefaultsOnInsert = true;
    p.push(Match.schema.insertMany([match], opt).catch((err) => { logger.error(err)}));

    logger.info("match "+type+" "+log.join(", "));

    return Promise.all(p);
}

module.exports.findMatch = (entries, n, sexConstraint) => {
    let list = [];
    let ngList = [];
    let sex = JSON.parse(JSON.stringify(sexConstraint));

    logger.debug("find "+n);

    for (let entry of entries) {
        let user = entry._id;

        if (!this.checkNg(list, ngList, user)) continue;

        // 性別上限チェック
        if (sex[user.sex] === 0) continue;
        sex[user.sex]--;

        list.push(entry);
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
            let matched = this.findMatch(entries, number, actSexConstraint[number]);
            if (matched.length === 0) { // マッチング失敗
                failCount--;
            } else {
                entries = entries.filter((n) => {
                    for (let entry of matched) {
                        if (entry._id === n._id) {
                            return false;
                        }
                    }
                    return true;
                });
                await this.matched(matched, type);
            }
        }
        if (failCount === 0) break;
    }

    logger.debug("match end");
}

module.exports.matchEvent = async (event) => {
    logger.debug("even match start");
    let scenario = event.scenario;
    let type = "event";
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
        logger.info(scenario.title+" matching num: "+entries.length);
    }

    let number = scenario.chara.length;
    let sexConstraint = {"f": 0, "m": 0};
    for (let c of scenario.chara) {
        sexConstraint[c.sex]++;
    }

    while (1) {
        let matched = this.findMatch(entries, number, sexConstraint);
        if (matched.length === 0) { // マッチング失敗
            break;
        } else {
            entries = entries.filter((n) => {
                for (let entry of matched) {
                    if (entry._id === n._id) {
                        return false;
                    }
                }
                return true;
            });
            await this.matched(matched, type);
        }
    }

    logger.debug("event match end");
}
