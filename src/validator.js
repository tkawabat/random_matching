"use strict";

const { check, validationResult } = require("express-validator/check")


const isError = function(req) {
    let errors = validationResult(req);
    return !errors.isEmpty();
}

const user = [
  check("skype_id").isLength({ min: 3 })
  , check("sex").custom((v, { req}) => v === "m" || v === "f")
];


module.exports = {
    isError: isError
    ,user: user
}
