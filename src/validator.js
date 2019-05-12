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

module.exports.sanitizeInvalid = (req) => {
    let param = JSON.parse(JSON.stringify(req.body));
    for(let error of validationResult(req).array()) {
        delete param[error.param];
    }
    return param;
}

module.exports.user = [
    check("skype_id")
        .isLength({min: 3, max: 64})
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
        .isLength({max: C.TEXT_LENGTH_MAX})
        .not().matches(C.REGEX_INVALID_STRINGS)
    ,check("place")
        .not().isEmpty()
        .custom((v, {req}) => C.RESERVE_PLACE[v])
    ,check("minutes")
        .not().isEmpty()
        .isNumeric({min: 0, max: 9999})
    ,check("author")
        .custom((v, {req}) => {
            if (!v) return true;

            if (v.match(C.REGEX_INVALID_STRINGS) !== null) return false;
            if (v.length > C.TEXT_LENGTH_MAX) return false;
            return true;
        })
    ,check("url")
        .custom((v, {req}) => {
            if (!v) return true;

            if (!validator.isURL(v)) return false;
            if (v.length > C.URL_LENGTH_MAX) return false;
            return true;
        })
    ,check("agree_url")
        .custom((v, {req}) => {
            if (!v) return true;

            if (!validator.isURL(v)) return false;
            if (v.length > C.URL_LENGTH_MAX) return false;
            return true;
        })
    ,check("chara_list")
        .isArray()
        .custom((v, {req}) => {
            if (v.length > 50) return false;
            for (let i = 0; i < v.length; i++) {
                if (v[i].length > C.TEXT_LENGTH_MAX) return false;
                if (v[i].match(C.REGEX_INVALID_STRINGS) !== null) return false;
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
        .isLength({max: C.OBJECT_ID_LENGTH_MAX})
        .isAlphanumeric()
];
module.exports.reserve.entryGuest = [
    check("chara")
        .not().isEmpty()
        .isLength({max: C.OBJECT_ID_LENGTH_MAX})
        .isAlphanumeric()
    ,check("name")
        .not().isEmpty()
        .isLength({max: C.TEXT_LENGTH_MAX})
        .not().matches(C.REGEX_INVALID_STRINGS)
];
module.exports.reserve.cancelEntry = [
    check("chara")
        .not().isEmpty()
        .isLength({max: C.OBJECT_ID_LENGTH_MAX})
        .isAlphanumeric()
];
