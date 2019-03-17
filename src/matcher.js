"use strict";

const rootDir = require("app-root-path");
const logger = require(rootDir + "/src/log4js");
const ActEntry = require(rootDir + "/src/model/actEntry");
const Match = require(rootDir + "/src/model/match");


const shuffle = (array) => {
    for(var i = array.length - 1; i > 0; i--){
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
}

const match = (array) => {
    let ids = [];
    for (let i =0; i < array.length; i++) {
        ids.push(array[i]._id);
    }

    logger.info("match: "+ids.join(", "));

    for (let i =0; i < array.length; i++) {
        ActEntry.deleteOne({_id: array[i]._id}, (err, entry) => {
            if (err) {
                logger.error(err);
                throw err;
            }
        });
        let match = new Match({
            _id: array[i]._id
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

const matchAct = () => {
    logger.info("match start");
    ActEntry.find({}, (err, entries) => {
        if (err) {
            logger.error(err);
            throw err;
            return;
        }

        while (1) {
            let numbers = shuffle([3]); // 人数候補
            let failCount = numbers.length;
            while (numbers.length > 0) {
                let n = numbers.pop();
                if (entries.length < n) {
                    failCount--;
                    continue;
                }
                match(entries.splice(0, n));
            }
            if (failCount === 0) break;
        }

        for (let i = 0; i < entries.length; i++) {
            match([entries[i]]); // 一人
        }

    });
    logger.info("match end");
}


module.exports = {
    matchAct: matchAct
};
