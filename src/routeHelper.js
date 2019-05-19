"use strict";

const rootDir = require("app-root-path");
const logger = require(rootDir + "/src/log4js");
const createError = require("http-errors");


const warning = {
    twitter_auth_failed: "Twitter認証で失敗しました。"
    ,validate: "入力値に問題があります。"
    ,entry_save: "マッチング開始に失敗しました。"
    ,entry_delete: "マッチングキャンセルに失敗しました。"
    ,reserve_create: "募集劇の作成に失敗しました。"
    ,reserve_limit: "短期間に大量の募集登録があったため、一週間作成ができません。"
    ,reserve_delete: "募集の削除に失敗しました。"
    ,reserve_entry: "エントリーに失敗しました。"
    ,reserve_entry_cancel: "エントリーキャンセルに失敗しました。"
    ,reserve_mvp: "MVP投票に失敗しました。"
    ,invalid_user: "このユーザーはエントリーできません。"
    ,error404: "ページが見つかりません。"
    ,error500: "予期せぬエラーが発生しました。時間を置いてアクセスしてください。"
}

const check = ( req, res, next) => {
    if (req.query.warning && warning[req.query.warning]) {
        res.viewParam.alert_warning.push(warning[req.query.warning]);
    }

    next();
};

const Error404 = (req, res, next) => {
    res.status(404);
    res.viewParam.alert_warning.push(warning.error404);
    res.render("index", res.viewParam);
}

const Error500 = (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);

    logger.error(err);

    res.viewParam.alert_warning.push(warning.error500);
    res.render("index", res.viewParam);
}


module.exports = {
    check: check
    ,Error404: Error404
    ,Error500: Error500
}
