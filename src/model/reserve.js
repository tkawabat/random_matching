"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: String }
        ,owner: { type: String, ref: "user" }
        ,scenario_id: { type: String, ref: "scenario" }
        ,start_at: { type: Date }
        ,chara: [
            name: { type: String }
            sex: { type: String }
            user: {type: String, ref: "user"}
        ]
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);
schema.index("created_at", {expireAfterSeconds: 60 * 30});

module.exports.schema = db.model("reverse", schema);
