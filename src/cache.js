"use strict";

const cacheman = require("cacheman");


const TTL = 60 * 10;

module.exports = new cacheman({ ttl: TTL });
