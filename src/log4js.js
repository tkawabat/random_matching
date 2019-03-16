"use strict";

const rootDir = require("app-root-path");
const log4js = require("log4js")

let file;
if (process.env.NODE_ENV === "prod") {
    file = "prod.log";
} else {
    file = "dev.log";
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
        default: { appenders: [ "app", "console" ], level: "debug" }
    }
    ,pm2: true
    ,pm2InstanceVar: "INSTANCE_ID"
});

const logger = log4js.getLogger("app");



module.exports = logger;
