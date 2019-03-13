"use strict";

const { check, validationResult } = require("express-validator/check")


const isError = function(req) {
    let errors = validationResult(req);
    return !errors.isEmpty();
}

const user = [
  check("skype_id")
    .isLength({ min: 3 })
    .matches(/^[a-zA-Z0-9_\.\-:]*$/)
  , check("sex")
    .custom((v, { req}) => !v || v === "m" || v === "f")
];

const actEntry = [
];


module.exports = {
    isError: isError
    ,user: user
    ,actEntry: actEntry
}
