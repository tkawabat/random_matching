"use strict";

const rootDir = require("app-root-path");
const express = require("express");
const mongoose = require("mongoose");

const secret = require(rootDir + "/secret.json");
const logger = require(rootDir + "/src/log4js");


const hosts = [
    "random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017",
    "random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017",
    "random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017",
];

let db_name;
if (process.env.NODE_ENV === "prod") {
    db_name = "random_matching";
} else if (process.env.NODE_ENV === "test") {
    db_name = "random_matching_test";
} else {
    db_name = "random_matching_dev";
}
const uri = "mongodb://"+hosts.join(",")+"/"+db_name;

mongoose.connect(uri, {
    useNewUrlParser: true
    ,user: secret.mongodb.user
    ,pass: secret.mongodb.password
    ,ssl: true
    ,replicaSet: "random-matching-free-0-shard-0"
    ,authSource: "admin"
    ,connectTimeoutMS: 1000
    ,bufferCommands: false
});

mongoose.connection.on("error", (err) => {
    logger.err(err);
    throw err;
});
mongoose.connection.once("open", () =>  {
    logger.info("connected mongodb: "+db_name);
});

module.exports = mongoose;
