"use strict";

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const rootDir = require("app-root-path");
const helmet = require("helmet")
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");

const account = require(rootDir + "/src/account");
const routeHelper = require(rootDir + "/src/routeHelper");


const app = express();

app.use(require(rootDir + "/src/morgan"));
app.use(helmet())
app.set("trust proxy", 1)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(rootDir +"/public"));
app.use(expressLayouts);
app.set("views", rootDir+"/views");
app.set("view engine", "ejs");

// auth
app.use(account.session);
app.use(account.passport.initialize());
app.use(account.passport.session());


// router
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));
app.use("/entry", require("./routes/entry"));


// schedule


// catch 404 and forward to error handler
app.use(routeHelper.Error404);
app.use(routeHelper.Error500);

module.exports = app;
