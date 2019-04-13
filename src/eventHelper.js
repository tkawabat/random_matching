"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const logger = require(rootDir + "/src/log4js");
const Scenario = require(rootDir + "/src/model/scenario");
const Event = require(rootDir + "/src/model/event");

let events = [];


module.exports.get = () => {
    return events;
}

module.exports.update = async () => {
    let res;
    try {
        res = await Event.schema.find({
            start_at : { $lt: new Date() }
            ,end_at: { $gt: new Date() }
        }).populate("scenario").exec();
    } catch (err) {
        logger.error(err);
        return; 
    }

    events = res;
}
