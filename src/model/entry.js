"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir + "/src/const");
const db = require(rootDir + "/src/mongodb");

const schema = db.Schema(
    {
        _id: { type: String, ref: "user" }
        ,type: [{ type: String }]
        ,tags: [{ type: String }]
    },
    { 
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" } 
    }
);
schema.index("created_at", {expireAfterSeconds: C.ENTRY_EXPIRE_SECONDS});

const model = {}
model.isEntryExist = async (type) => {
    let res = await this.schema.findOne({type: type }, C.MONGO_OPT).exec();
    if (res) {
        return true;
    } else {
        return false;
    }
};

model.countByType = async () => {
    return this.schema.aggregate(
        [
            { $unwind: "$type" }
            , { $group : { _id: "$type", count: { $sum: 1 } } }
        ]).catch((err) => {
            logger.error(err);
            next(err);
        }).then((count) => {
            let arr = {};
            for (let c of count) {
                arr[c._id] = c.count;
            }
            return arr;
        });
}

module.exports.schema = db.model("entry", schema);
module.exports.model = model;
