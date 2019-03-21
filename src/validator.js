"use strict";

const { check, validationResult } = require("express-validator/check")


module.exports.isError = (req) => {
    let errors = validationResult(req);
    return !errors.isEmpty();
}

module.exports.user = [
  check("skype_id")
    .isLength({min: 3})
    .isLength({max: 64})
    .matches(/^[a-zA-Z0-9_\.\-:]*$/)
  , check("sex")
    .custom((v, { req}) => !v || v === "m" || v === "f")
];

module.exports.entry = [
];
