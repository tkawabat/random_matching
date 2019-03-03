"use strict";

let rootDir = require("app-root-path");
let secret = require(rootDir + "/secret.json");
let mongoose = require("mongoose");


let hosts = [
    "random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017",
    "random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017",
    "random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017",
];
let db_name = "random_matching";
let uri = "mongodb://"+hosts.join(",")+"/"+db_name;

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
const db = mongoose.connection;

db.on("error", console.error.bind(console, "fail to connected to mongodb: "+db_name));
db.once("open", () =>  {
    console.log("connected mongodb: "+db_name)
});

module.exports = db;
