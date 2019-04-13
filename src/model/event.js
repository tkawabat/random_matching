"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: String }
        ,title: { type: String}
        ,caution: [{ type: String}]
        ,scenario: { type: db.Schema.Types.ObjectId, ref: "scenario" }
        ,start_at: { type: Date }
        ,end_at: { type: Date }
        ,match_count: { type: Number }
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);

module.exports.schema = db.model("event", schema);
