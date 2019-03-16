"use strict";

const rootDir = require("app-root-path");
const log4js = require("log4js")


log4js.configure({
    appenders : {
        console: { type: "console" }
        ,app: {
            type: "file"
            ,filename: rootDir+"/log/app.log"
            ,maxLogSize: 10 * 1024 * 1024 // 10MB
        }
    }
    ,categories: {
        default: { appenders: [ "app", "console" ], level: "debug" }
    }
    ,pm2: true
    ,pm2InstanceVar: "INSTANCE_ID"
});

const logger = log4js.getLogger("app");

module.exports = logger;
