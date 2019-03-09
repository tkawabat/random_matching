"use strict";

//let mongoose = require("mongoose");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

let db = require("../mongodb");

const userSchema = db.Schema({
    _id: { type: String }
    ,name: { type: String }
    ,skype: { type: String }
    ,sex: { type: String }
    ,image_url_https: { type: String }
    ,twitter_updated_at: { type: Date }
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = db.model("user", userSchema);