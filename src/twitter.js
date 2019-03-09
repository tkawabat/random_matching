"use strict";

const twitter = require("twitter");
const fs = require("fs");

let json = JSON.parse(fs.readFileSync("secret.json","utf-8")).twitter;
const client = new twitter(json);

client.get("account/settings", {}, function(error, tweet, response){
    if (!error) {
        console.log(tweet);
    } else {
        console.log(error);
    }
});

exports.twitter = twitter;
