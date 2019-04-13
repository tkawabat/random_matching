"use strict";

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const rootDir = require("app-root-path");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
moment.locale("ja", {
    weekdays: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
    weekdaysShort: ["日","月","火","水","木","金","土"]
});

const logger = require(rootDir + "/src/log4js");
const morgan = require(rootDir + "/src/morgan");
const db = require(rootDir + "/src/mongodb");
const account = require(rootDir + "/src/account");
const matcher = require(rootDir + "/src/matcher");
const routeHelper = require(rootDir + "/src/routeHelper");
const eventHelper = require(rootDir + "/src/eventHelper");
const schedule = require(rootDir + "/src/schedule");


const app = express();

app.use(morgan);
app.use(helmet())
app.use(compression())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(rootDir +"/public"));
app.use(expressLayouts);
app.set("trust proxy", 1)
app.set("views", rootDir+"/views");
app.set("view engine", "ejs");

let title;
if (process.env.NODE_ENV === "prod") {
    title = "きまぐれ日和";
} else {
    title = "テストな日和";
}

app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    res.removeHeader("ETag");
    res.header("Strict-Transport-Security", "max-age=15552000");
    res.header("Cache-Control", ["private", "no-store", "no-cache", "must-revalidate", "proxy-revalidate"].join(","));
    res.header("no-cache", "Set-Cookie");
    res.header("Pragma", "no-cache");
    res.header("Expires", -1);

    let event = eventHelper.get();
    res.viewParam = {
        moment: moment
        ,title: title
        ,alert_warning: ""
        ,alert_info: ""
        ,event: event
    };
    next();
});

// auth
app.use(account.session);
app.use(account.passport.initialize());
app.use(account.passport.session());


// router
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));
app.use("/entry", require("./routes/entry"));

// event
db.connection.once("open", () => {
    eventHelper.update();
});

// schedule
schedule.push("act3-7", false, "0 21-22 * * *", () => {
    matcher.match("act3_7");
});
schedule.push("act2", false, "* * * * *", () => {
    matcher.match("act2");
});
schedule.push("event_update", false, "*/5 * * * *", () => {
    eventHelper.update();
});

// catch 404 and forward to error handler
//app.use(routeHelper.Error404); // mapファイルが404を起こすのでコメントアウト
app.use(routeHelper.Error500);

module.exports = app;
