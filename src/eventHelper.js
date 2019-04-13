"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const logger = require(rootDir + "/src/log4js");
const Scenario = require(rootDir + "/src/model/scenario");
const Event = require(rootDir + "/src/model/event");

let event = {};


module.exports.get = () => {
    return event;
}

module.exports.update = async () => {
    let res;
    try {
        // TODO 同時開催対応
        res = await Event.schema.findOne({
            start_at : { $lt: new Date() }
            ,end_at: { $gt: new Date() }
        }).populate("scenario").exec();
    } catch (err) {
        logger.error(err);
        return; 
    }

    event = res;
}
