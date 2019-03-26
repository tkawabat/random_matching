"use strict";

const rootDir = require("app-root-path");
const log4js = require("log4js")

let file;
let level;
if (process.env.NODE_ENV === "prod") {
    file = "prod.log";
    level = "info";
} else if (process.env.NODE_ENV === "test") {
    file = "test.log";
    level = "error";
} else {
    file = "dev.log";
    level = "debug";
}

log4js.configure({
    appenders : {
        console: { type: "console" }
        ,app: {
            type: "file"
            ,filename: rootDir+"/log/"+file
            ,maxLogSize: 10 * 1024 * 1024 // 10MB
        }
    }
    ,categories: {
        default: { appenders: [ "app", "console" ], level: level }
    }
    ,pm2: true
    ,pm2InstanceVar: "INSTANCE_ID"
});

const logger = log4js.getLogger("app");



module.exports = logger;
