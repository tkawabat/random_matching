"use strict";

const rootDir = require("app-root-path");
const log4js = require("log4js")


log4js.configure({
    appenders : {
        console: { type: "console" }
        ,app: {
            type: "file"
            ,filename: rootDir+"/app.log"
            ,maxLogSize: 10 * 1024 * 1024 // 10MB
        }
    }
    ,categories: {
        default: { appenders: [ "app", "console" ], level: "debug" }
    }
});

const logger = log4js.getLogger("app");
logger.level = "debug";

module.exports = logger;
