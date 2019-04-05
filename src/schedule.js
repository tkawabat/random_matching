"use strict";

const schedule = require("node-schedule");


module.exports.jobs = {};

module.exports.push = (name, cron, fn) => {
    this.jobs[name] = schedule.scheduleJob(cron, fn);
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
