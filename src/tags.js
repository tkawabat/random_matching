"use strict";

const rootDir = require("app-root-path");

const C = require(rootDir + "/src/const");
const logger = require(rootDir + "/src/log4js");


module.exports.parse = (raw) => {
    let ret = [];
    let arr = [];
    try { 
        arr = JSON.parse(raw);
    } catch (e) {};

    if (!arr) return ret;

    for (let obj of arr) {
        if (obj && obj.value) ret.push(obj.value);
    }

    return ret;
}
 
