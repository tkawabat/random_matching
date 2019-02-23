"use strict";

let rootDir = require("app-root-path");
let createError = require("http-errors");
let path = require("path");
let logger = require("morgan");
let cookieParser = require("cookie-parser");

let express = require("express");
let app = express();

let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");

let account = require(rootDir + "/src/account");


app.use(account.session({
    secret: "secret-key",
    resave: true,
    saveUninitialized: true
}));
app.use(account.passport.initialize());
app.use(account.passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

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
