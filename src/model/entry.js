"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: String, ref: "user" }
        ,type: [{ type: String }]
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);
schema.index("created_at", {expireAfterSeconds: 60 * 30});

const model = {}
model.isEntryExist = async () => {
    let res = await this.schema.findOne().exec();
    if (res) {
        return true;
    } else {
        return false;
    }
};

module.exports.schema = db.model("entry", schema);
module.exports.model = model;
