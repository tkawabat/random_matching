"use strict";

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const rootDir = require("app-root-path");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const morgan = require(rootDir + "/src/morgan");
const account = require(rootDir + "/src/account");
const matcher = require(rootDir + "/src/matcher");
const routeHelper = require(rootDir + "/src/routeHelper");


const app = express();

app.use(morgan);
app.use(helmet())
app.use(compression())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(rootDir +"/public"));
app.use(expressLayouts);
app.set("trust proxy", 1)
app.set("views", rootDir+"/views");
app.set("view engine", "ejs");

app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    res.removeHeader("ETag");
    res.header("Strict-Transport-Security", "max-age=15552000");
    res.header("Cache-Control", ["private", "no-store", "no-cache", "must-revalidate", "proxy-revalidate"].join(","));
    res.header("no-cache", "Set-Cookie");
    res.header("Pragma", "no-cache");
    res.header("Expires", -1);

    res.viewParam = {
        title: "気まぐれ日和"
        ,alert_warning: ""
        ,alert_info: ""
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


// schedule
schedule.scheduleJob(moment("2019-03-16 21:00:00").toDate(), matcher.matchAct);

// catch 404 and forward to error handler
//app.use(routeHelper.Error404); // mapファイルが404を起こすのでコメントアウト
app.use(routeHelper.Error500);

module.exports = app;
