"use strict";

let rootDir = require("app-root-path");
let mongoose = require("mongoose");

let secret = require(rootDir + "/secret.json");
let logger = require(rootDir + "/src/log4js");


let hosts = [
    "random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017",
    "random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017",
    "random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017",
];
let db_name = "random_matching";
let uri = "mongodb://"+hosts.join(",")+"/"+db_name;

mongoose.Promise = global.Promise;
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
}
mongoose.connection.once("open", () =>  {
    logger.info("connected mongodb: "+db_name);
});

module.exports = mongoose;
