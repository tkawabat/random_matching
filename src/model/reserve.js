"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const logger = require(rootDir + "/src/log4js");
const db = require(rootDir + "/src/mongodb");

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
        ,deleted: { type: Boolean }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

schema.index({ owner: 1, type: -1 });
schema.index({ scenario: 1, type: -1 });
schema.index({ start_at: 1, type: -1 });
schema.index({ public: 1, type: -1 });
schema.index({ deleted: 1, type: -1 });

module.exports.schema = db.model("reverse", schema);

const model = {};

model.get = async () => {
    return this.schema.find(
        { public: true }
        ,null
        ,{ sort: { "start_at": -1}, limit: 30 }
    )
    .populate("owner")
    .lean()
    ;
}

model.getNum = async (user) => {
    return this.schema.count({owner: user._id, start_at: { $gte: moment().toDate()}}).lean();
}

model.update = async (reserve, user) => {
    if (!reserve._id) {
        reserve._id = new db.Types.ObjectId;
    } else {
        let old = await this.schema.findOne({ _id: reserve._id }).exec();
        for (let i = 0; i < reserve.chara.length; i++) {
            if (old && old.chara[i] && old.chara[i].user
                && reserve.chara[i].name === old.chara[i].name
                && reserve.chara[i].sex === old.chara[i].sex) {
                reserve.chara[i].user = old.chara[i].user;
            } else if (old && old.chara[i] && old.chara[i].guest
                && reserve.chara[i].name === old.chara[i].name
                && reserve.chara[i].sex === old.chara[i].sex) {
                reserve.chara[i].guest = old.chara[i].guest;
            }
        }
    }

    return this.schema.findOneAndUpdate(
        { _id: reserve._id, owner: user._id }
        , reserve
        , { "strict": true, "upsert": true, "new": true}
    ).lean()
    .catch ((err) => {
        logger.info("update reserve error. reserve: "+reserve._id+" user: "+user._id);
        return null;
    })
    ;
};

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
