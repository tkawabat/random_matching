"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
moment.locale("ja");
const C = require(rootDir + "/src/const");
const { check, validationResult } = require("express-validator/check")
const validator = require("validator")
const logger = require(rootDir+"/src/log4js");
const tags = require(rootDir+"/src/tags");


module.exports.isError = (req) => {
    let errors = validationResult(req);
    logger.debug(errors.array());
    return !errors.isEmpty();
}

module.exports.getErrorMessages = (req) => {
    let messages = [];
    for (let error of validationResult(req).array()) {
        messages.push(error.msg);
    }
    return messages;
}
module.exports.sanitizeInvalid = (req) => {
    let param = JSON.parse(JSON.stringify(req.body));
    for (let error of validationResult(req).array()) {
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

module.exports.entry = {};
module.exports.entry.post = [
    check("entry_type")
        .custom((v, {req}) => !v || v === "act2" || v === "act3_7" || v === "event")
        .withMessage("不適切な入力です。")
    ,check("tags")
        .custom((v, {req}) => {
            let tagList = tags.parse(v);
            if (tagList.length > C.TAGS_MAX_NUMBER) return false;
            for (let tag of tagList) {
                if (tag.length > C.TAG_MAX_LENGTH) return false;
                if (tag.match(C.REGEX_INVALID_STRINGS) !== null) return false;
            }
            return true;
        })
        .withMessage("タグが不適切です。")
];
module.exports.entry.cancel = [
    check("entry_type")
        .custom((v, {req}) => !v || v === "act2" || v === "act3_7" || v === "event")
        .withMessage("不適切な入力です。")
];

module.exports.reserve = {};
module.exports.reserve.create = [
    check("_id")
        .custom((v, {req}) => {
            if (!v) return true;

            if (!validator.isAlphanumeric(v)) return false;
            if (!validator.isLength(v, {max: C.OBJECT_ID_LENGTH_MAX})) return false;
            return true;
        })
    ,check("start_at")
        .custom((v, {req}) => {
            if (!validator.isAfter(v)) return false;
            if (moment(v).unix() < moment().unix()) return false;
            if (moment(v).unix() > moment().add(2, "weeks").unix()) return false;
            return true;
        })
        .withMessage("開始日時が不適切です。")
    ,check("scenario_title")
        .isLength({max: C.TEXT_LENGTH_MAX})
        .not().matches(C.REGEX_INVALID_STRINGS)
        .withMessage("台本名が不適切です。")
    ,check("place")
        .not().isEmpty()
        .custom((v, {req}) => C.RESERVE_PLACE[v])
        .withMessage("場所が不適切です。")
    ,check("minutes")
        .not().isEmpty()
        .isNumeric({min: 0, max: 9999})
        .withMessage("時間(分)が不適切です。")
    ,check("author")
        .custom((v, {req}) => {
            if (!v) return true;

            if (v.match(C.REGEX_INVALID_STRINGS) !== null) return false;
            if (v.length > C.TEXT_LENGTH_MAX) return false;
            return true;
        })
        .withMessage("作者名が不適切です。")
    ,check("url")
        .custom((v, {req}) => {
            if (!v) return true;

            if (!validator.isURL(v)) return false;
            if (v.length > C.URL_LENGTH_MAX) return false;
            return true;
        })
        .withMessage("台本URLが不適切です。")
    ,check("agree_url")
        .custom((v, {req}) => {
            if (!v) return true;

            if (!validator.isURL(v)) return false;
            if (v.length > C.URL_LENGTH_MAX) return false;
            return true;
        })
        .withMessage("規約URLが不適切です。")
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
        .withMessage("役名が不適切です。")
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
        .withMessage("性別が不適切です。")
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
module.exports.reserve.mvp = [
    check("chara")
        .not().isEmpty()
        .isLength({max: C.OBJECT_ID_LENGTH_MAX})
        .isAlphanumeric()
];
