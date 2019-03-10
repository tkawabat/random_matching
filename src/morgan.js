"use strict";

const morgan = require("morgan");
const rootDir = require("app-root-path");
const rfs = require("rotating-file-stream")


//ファイルストリームを作成
const accessLogStream = rfs("access.log", {
    size:"10MB",
    interval: "10d",
    compress: "gzip",
    path: rootDir+"/log"
});

//カスタムトークン
morgan.token("user", (req, res) => {
    const log = req.user ? req.user.twitter_id : "guest";
    return log;
})

//ログのフォーマット
const preFormat = ":date[iso] :user :url :method :status :response-time ms"

let logger = morgan(preFormat, {
    stream: accessLogStream
    ,skip: (req, res) => {
        if (req.url.indexOf(".css") !== -1) return true;
        if (req.url.indexOf(".js") !== -1) return true;
        return false;
    }
})

module.exports = logger;
