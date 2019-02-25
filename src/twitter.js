'use strict';

const twitter = require("twitter");
const fs = require("fs");

const client = new twitter(JSON.parse(fs.readFileSync("secret.json","utf-8")));

exports.twitter = twitter;
