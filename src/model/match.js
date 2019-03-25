"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema({
    _id: { type: String, ref: "user"}
    ,ids: [{type: String, ref: "user"}]
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.index("created_at", {expireAfterSeconds: 60 * 60 * 1});

module.exports.schema = db.model("match", schema);
