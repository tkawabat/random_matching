"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
moment.locale("ja");
const C = require(rootDir + "/src/const");
const { check, validationResult } = require("express-validator/check")
const validator = require("validator")
const logger = require(rootDir+"/src/log4js");


module.exports.isError = (req) => {
    let errors = validationResult(req);
    logger.debug(errors.array());
    return !errors.isEmpty();
}

module.exports.user = [
    check("skype_id")
        .isLength({min: 3})
        .isLength({max: 64})
        .matches(/^[a-zA-Z0-9_\.\-:]*$/)
        .withMessage("SkypeIDが不適切です。")
    ,check("sex")
        .custom((v, {req}) => !v || v === "m" || v === "f")
        .withMessage("性別の値が不適切です。")
    ,check("ng_list")
        .custom((v, {req}) => {
            if (v === undefined) return true;

            if (!Array.isArray(v)) return false;
            if (v.length > 20) return false;
            for (let i = 0; i < v.length; i++) {
                if (v[i].length > 15) return false;
                if (v[i].match(/^[a-zA-Z0-9_]*$/) === null) return false;
            }

            return true;
        })
];

module.exports.entry = [
    check("entry_type")
        .custom((v, {req}) => !v || v === "act2" || v === "act3_7" || v === "event")
];

module.exports.reserve = {};
module.exports.reserve.create = [
    check("start_at")
        .isAfter() // 日付はあとで別途調べる
    ,check("scenario_title")
        .not().isEmpty()
        .not().matches(/[,;'"%&#><\\\n\r\0]/)
    ,check("place")
        .not().isEmpty()
        .custom((v, {req}) => C.RESERVE_PLACE[v])
    ,check("minutes")
        .not().isEmpty()
        .isNumeric()
    ,check("author")
        .not().matches(/[,;'"%&#><\\\n\r\0]/)
    ,check("url")
        .custom((v, {req}) => {
            if (!v) return true;
            if (validator.isURL(v)) return true;
        })
    ,check("agree_url")
        .custom((v, {req}) => {
            if (!v) return true;
            if (validator.isURL(v)) return true;
        })
    ,check("chara_list")
        .isArray()
        .custom((v, {req}) => {
            if (v.length > 50) return false;
            for (let i = 0; i < v.length; i++) {
                if (v[i].length > 50) return false;
                if (v[i].match(/[,;'"%&#><\\\n\r\0]/) !== null) return false;
            }

            return true;
        })
    ,check("sex_list")
        .isArray()
        .custom((v, {req}) => {
            if (v.length !== req.body.chara_list.length) return false;
            if (v.length > 50) return false;
            for (let i = 0; i < v.length; i++) {
                if (!C.SEX[v[i]]) return false;
            }

            return true;
        })
];
module.exports.reserve.entry = [
    check("chara")
        .not().isEmpty()
        .isAlphanumeric()
];
module.exports.reserve.entryGuest = [
    check("chara")
        .not().isEmpty()
        .isAlphanumeric()
    ,check("name")
        .not().isEmpty()
        .not().matches(/[,;'"%&#><\\\n\r\0]/)
];
module.exports.reserve.cancelEntry = [
    check("chara")
        .not().isEmpty()
        .isAlphanumeric()
];
