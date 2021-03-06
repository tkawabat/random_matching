"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: db.Schema.Types.ObjectId }
        ,title: { type: String }
        ,author: { type: String }
        ,url :{ type: String }
        ,agree_url: { type: String }
        ,chara: [{
            name: { type: String }
            ,sex: { type: String }
        }]
        ,minutes: { type: Number }
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);

module.exports.schema = db.model("scenario", schema);
