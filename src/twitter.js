"use strict";

const twitter = require("twitter");
const fs = require("fs");

const client = new twitter(JSON.parse(fs.readFileSync("secret.json","utf-8")));

client.get("account/settings", {}, function(error, tweet, response){
    if (!error) {
        console.log(tweet);
    } else {
        console.log(error);
    }
});

exports.twitter = twitter;
