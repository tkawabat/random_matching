"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require("../mongodb");

const schema = db.Schema(
    {
        _id: { type: db.Schema.Types.ObjectId }
        ,owner: { type: String, ref: "user" }
        ,scenario: { type: db.Schema.Types.ObjectId, ref: "scenario" }
        ,scenario_title: { type: String }
        ,author: { type: String }
        ,url: { type: String }
        ,agree_url: { type: String }
        ,minutes: { type: Number }
        ,start_at: { type: Date }
        ,place: { type: String }
        ,public: { type: Boolean }
        ,chara: [{
            name: { type: String }
            ,sex: { type: String }
            ,user: {type: String, ref: "user"}
            ,guest: {type: String}
        }]
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

module.exports.schema = db.model("reverse", schema);

const model = {};

model.entry = async (user, id) => {
    return this.schema.findOneAndUpdate(
        { chara: {
            $elemMatch: { _id: id, sex: { $in: ["o", user.sex]}, user: null, guest: null }
            , $not: { $elemMatch: { user: user._id } }
        } }
        ,{ $set: { "chara.$.user": user._id}}
        ,{ strict: true, new: true}
    ).lean();
};

model.entryGuest = async (user, id, name) => {
    return this.schema.findOneAndUpdate(
        {
            owner: user._id
            ,chara: {
                $elemMatch: { _id: id, user: null, guest: null }
            }
        }
        ,{ $set: { "chara.$.guest": name}}
        ,{ strict: true, new: true}
    ).lean();
};

model.cancelEntry = async (user, id) => {
    return this.schema.findOneAndUpdate(
        { chara: { $elemMatch: { _id: id, user: user._id } } }
        ,{ $set: { "chara.$.user": null }}
        ,{ strict: true, new: true}
    ).lean();
};

model.cancelEntryByOwner = async (user, id) => {
    return this.schema.findOneAndUpdate(
        { owner: user._id, chara: { $elemMatch: { _id: id } } }
        ,{ $set: { "chara.$.user": null, "chara.$.guest": null }}
        ,{ strict: true, new: true}
    ).lean();
};

module.exports.model = model;
