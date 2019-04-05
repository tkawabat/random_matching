"use strict";

const rootDir = require("app-root-path");
const schedule = require("node-schedule");
const logger = require(rootDir + "/src/log4js");


module.exports.jobs = {};

module.exports.push = (name, cron, fn) => {
    if (this.jobs[name]) {
        logger.info("skip duplicated name schedule push");
    } else {
        this.jobs[name] = schedule.scheduleJob(cron, fn);
    }
};

module.exports.cancel = (name) => {
    if (this.jobs[name]) {
        this.jobs[name].cancel();
    }
}

module.exports.cancelAll = () => {
    for (let key of Object.keys(this.jobs)) {
        this.jobs[key].cancel();
    }
}
