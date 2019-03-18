"use strict";

let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

let db = require("../mongodb");

const schema = db.Schema({
    _id: { type: String, ref: "user"}
    ,ids: [{type: String, ref: "user"}]
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.index("created_at", {expireAfterSeconds: 60 * 60 * 3});

module.exports = db.model("match", schema);
