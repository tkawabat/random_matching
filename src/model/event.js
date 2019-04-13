"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: String }
        ,name: { type: String}
        ,senario: { type: String, ref: "senario" }
        ,end_at: { type: Date }
        ,count: { type: Number }
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);

module.exports.schema = db.model("event", schema);
