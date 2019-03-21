"use strict";

process.env.NODE_ENV = "test";

const rootDir = require("app-root-path");

const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const Entry = require(rootDir+"/src/model/entry");
const Match = require(rootDir+"/src/model/match");
const matcher = require(rootDir+"/src/matcher");

db.connection.once("open", async () => {
    await User.deleteMany().exec();
    await User.insertMany([
        {_id: "100", sex: "f", twitter_name:"0"}
        ,{_id: "101", sex: "f", twitter_name:"1"}
        ,{_id: "102", sex: "f", twitter_name:"2"}
        ,{_id: "103", sex: "f", twitter_name:"3"}
        ,{_id: "104", sex: "f", twitter_name:"4"}
        ,{_id: "105", sex: "f", twitter_name:"5"}
        ,{_id: "106", sex: "f", twitter_name:"6"}
        ,{_id: "107", sex: "f", twitter_name:"7"}
        ,{_id: "108", sex: "f", twitter_name:"8"}
        ,{_id: "109", sex: "f", twitter_name:"9"}
        ,{_id: "200", sex: "m", twitter_name:"0"}
        ,{_id: "201", sex: "m", twitter_name:"1"}
        ,{_id: "202", sex: "m", twitter_name:"2"}
        ,{_id: "203", sex: "m", twitter_name:"3"}
        ,{_id: "204", sex: "m", twitter_name:"4"}
        ,{_id: "205", sex: "m", twitter_name:"5"}
        ,{_id: "206", sex: "m", twitter_name:"6"}
        ,{_id: "207", sex: "m", twitter_name:"7"}
        ,{_id: "208", sex: "m", twitter_name:"8"}
        ,{_id: "209", sex: "m", twitter_name:"9"}
    ]);

    db.disconnect();
});
