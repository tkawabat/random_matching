"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: db.Schema.Types.ObjectId }
        ,owner: { type: String, ref: "user" }
        ,scenario: { type: db.Schema.Types.ObjectId, ref: "scenario" }
        ,start_at: { type: Date }
        ,place: { type: String }
        ,public: { type: Boolean }
        ,chara: [{
            name: { type: String }
            ,sex: { type: String }
            ,user: {type: String, ref: "user"}
        }]
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);

module.exports.schema = db.model("reverse", schema);
