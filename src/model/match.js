"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const C = require(rootDir+"/src/const");
const db = require(rootDir+"/src/mongodb");

const schema = db.Schema({
    _id: { type: db.Schema.Types.ObjectId }
    ,type: {type: String }
    ,matched: [{
        user: {type: String, ref: "user"}
        , tags: [{ type: String }]
    }]
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
schema.index("created_at", {expireAfterSeconds: C.MATCH_EXPIRE_SECONDS});

module.exports.schema = db.model("match", schema);

module.exports.model = {}
module.exports.model.get = async (user) => {
    return this.schema.findOne(
        { matched: { $elemMatch: { user: user }} }
        , {}
        , C.MONGO_OPT
    )
    .populate("matched.user")
    .lean()
    ;
}
