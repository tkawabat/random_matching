"use strict";

let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

let db = require("../mongodb");

const schema = db.Schema({
    _id: { type: String}
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = db.model("actEntry", schema);
