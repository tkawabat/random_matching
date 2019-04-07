"use strict";

const rootDir = require("app-root-path");
const schedule = require("node-schedule");
const logger = require(rootDir + "/src/log4js");


module.exports.jobs = {};

module.exports.push = (name, once, cron, fn) => {
    if (this.jobs[name]) {
        logger.info("skip duplicated name schedule push");
        return;
    }

    logger.info("push schedule "+name);
    this.jobs[name] = schedule.scheduleJob(cron, fn);

    if (once) {
        let fn = this.cancel;
        this.jobs[name].on("run", () => {
            fn(name);
        });
    }
};

module.exports.cancel = (name) => {
    if (this.jobs[name]) {
        logger.info("cancel schedule "+name);
        this.jobs[name].cancel();
        delete this.jobs[name];
    }
}

module.exports.cancelAll = () => {
    for (let key of Object.keys(this.jobs)) {
        this.jobs[key].cancel();
    }
}
