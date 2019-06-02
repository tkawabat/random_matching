"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir+"/src/const");
const db = require(rootDir+"/src/mongodb");

const schema = db.Schema({
    _id: { type: String, ref: "user"}
    ,ids: [{type: String, ref: "user"}]
    ,type: {type: String }
    ,tags: [{ type: String }]
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.index("created_at", {expireAfterSeconds: C.MATCH_EXPIRE_SECONDS});

module.exports.schema = db.model("match", schema);
