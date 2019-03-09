"use strict";

let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

let db = require("../mongodb");

const userSchema = db.Schema({
    _id: { type: String }
    ,twitter_token: { type: String}
    ,twitter_token_secret: { type: String}
    ,twitter_id: { type: String }
    ,twitter_name: { type: String }
    ,twitter_created_at: { type: Date }
    ,skype_id: { type: String }
    ,sex: { type: String }
    ,image_url_https: { type: String }
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = db.model("user", userSchema);
