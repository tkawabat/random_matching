"use strict";

const rootDir = require("app-root-path");
const logger = require(rootDir + "/src/log4js");
const createError = require("http-errors");


const warning = {
    twitter_auth_failed: "Twitter認証で失敗しました"
    ,validate: "入力値に問題があります"
    ,entry_save: "マッチング開始に失敗しました"
    ,entry_delete: "マッチングキャンセルに失敗しました"
    ,reserve_entry: "エントリーに失敗しました"
    ,reserve_entry_cancel: "エントリーキャンセルに失敗しました"
    ,invalid_user: "このユーザーはエントリーできません"
    ,error500: "予期せぬエラーが発生しました。時間を置いてアクセスしてください"
}

const check = ( req, res, next) => {
    if (req.query.warning && warning[req.query.warning]) {
        res.viewParam.alert_warning = warning[req.query.warning];
    }

    next();
};

const Error404 = (req, res, next) => {
    next(createError(404));
}

const Error500 = (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);

    logger.error(err);

    res.viewParam.alert_warning = warning.error500;
    res.render("index", res.viewParam);
}


module.exports = {
    check: check
    ,Error404: Error404
    ,Error500: Error500
}
