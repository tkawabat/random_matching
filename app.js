"use strict";

const express = require("express");
const rootDir = require("app-root-path");
const createError = require("http-errors");
const helmet = require('helmet')
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const account = require(rootDir + "/src/account");
const db = require(rootDir + "/src/mongodb");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const twitterRouter = require("./routes/twitter");


const app = express();

// security
app.use(logger("dev"));
app.use(helmet())
app.set('trust proxy', 1)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// auth
app.use(account.session({
    secret: "secret-key",
    name: "session_id",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 90 // ミリ秒
    }
}));
app.use(account.passport.initialize());
app.use(account.passport.session());


// router
app.use("/", indexRouter);
app.use("/users", usersRouter);
//app.use("/twitter", twitterRouter);
app.use("/twitter", twitterRouter.configRoutes(app, account.passport));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
