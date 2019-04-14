"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const logger = require(rootDir + "/src/log4js");
const Scenario = require(rootDir + "/src/model/scenario");
const Event = require(rootDir + "/src/model/event");

let event = null;


module.exports.get = () => {
    if (!event) return null;
    let now = moment();
    if (now.isBetween(moment(event.start_at), moment(event.end_at))) {
        return event;
    } else {
        return null;
    }
}

module.exports.update = async () => {
    let res;
    try {
        // TODO 同時開催対応
        let now = moment().toDate();
        res = await Event.schema.findOne({
            end_at: { $gt: now }
        }).sort("start_at").populate("scenario").exec();
    } catch (err) {
        logger.error(err);
        return; 
    }

    event = res;
}
