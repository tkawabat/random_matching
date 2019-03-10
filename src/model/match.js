"use strict";

let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

let db = require("../mongodb");

const schema = db.Schema({
    _id: { type: String}
    ,ids: {type: [String]}
    ,expire_at: {
        type: Date,
        default: new Date(),
        expires: 1000 * 60 * 60 * 3 // 3hour
    }
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = db.model("match", schema);
