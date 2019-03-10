"use strict";

const rootDir = require("app-root-path");
const logger = require(rootDir + "/src/log4js");
const createError = require("http-errors");


const warning = {
    twitter_auth_failed: "Twitter認証で失敗しました"
    ,validate: "入力値に問題があります"
    ,user_save: "ユーザー情報の更新に失敗しました"
    ,entry_save: "マッチング開始に失敗しました"
    ,entry_delete: "マッチングキャンセルに失敗しました"
    ,error500: "予期せぬエラーが発生しました。時間を置いてアクセスしてください"
}
const info = {
    user_save: "ユーザー情報を更新しました"
}
const param = {
    title: "気まぐれ日和"
    ,alert_warning: ""
    ,alert_info: ""
}

const check = ( req, res, next) => {

    if (req.query.warning && warning[req.query.warning]) {
        param.alert_warning = warning[req.query.warning];
    }
    if (req.query.info && info[req.query.info]) {
        param.alert_info = info[req.query.info];
    }

    res.viewParam = param;
    next();
};

const Error404 = (req, res, next) => {
    res.viewParam = param;
    next(createError(404));
}

const Error500 = (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);

    logger.error(err);

    param.alert_warning = warning.error500;
    res.render("index", param);
}


module.exports = {
    check: check
    ,Error404: Error404
    ,Error500: Error500
}
