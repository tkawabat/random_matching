"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const logger = require(rootDir + "/src/log4js");
const C = require(rootDir + "/src/const");
const schedule = require(rootDir + "/src/schedule");
const db = require(rootDir + "/src/mongodb");
const User = require(rootDir+"/src/model/user");
const reserveHelper = require(rootDir+"/src/reserveHelper");

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
            ,mvp: [{ type: String, ref: "user"}]
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

model.get = async (filter) => {
    return this.schema.find(
        filter
        ,null
        ,{ sort: { "start_at": -1}, limit: 30 }
    )
    .populate("owner")
    .lean()
    ;
}

model.isLimited = async (user) => {
    let time = moment().add("-1", "weeks").toDate();
    return this.schema.count(
        {owner: user._id, start_at: { $gte: time}}
    ).lean().then((ret) => ret > C.RESERVE_LIMIT_PER_WEEK);
}

model.update = async (reserve, user) => {
    let opt;
    let push = false;
    if (!reserve._id) {
        reserve._id = new db.Types.ObjectId;
        push = true;
        opt = { "strict": true, "upsert": true, "new": true};
    } else {
        opt = { "strict": true, "new": true};
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
        push = old && old.public !== "true";
    }

    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").toDate();
    return this.schema.findOneAndUpdate(
        { _id: reserve._id, owner: user._id, start_at: { $gte: time }}
        , reserve
        , opt
    ).lean()
    .then((ret) => {
        // tweet
        if (push && ret.public === true) {
            let t = moment().add(5, "minutes").toDate();
            schedule.push("reserve_create_"+reserve._id, true, t, () => {
                reserveHelper.tweetCreated(reserve);
            });
        }
        return ret;
    })
    .catch ((err) => {
        logger.info("update reserve error. reserve: "+reserve._id+" user: "+user._id);
        return null;
    })
    ;
};

model.entry = async (user, id) => {
    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").toDate();
    return this.schema.findOneAndUpdate(
        {
            start_at: { $gte: time }
            ,chara: {
                $elemMatch: { _id: id, sex: { $in: ["o", user.sex]}, user: null, guest: null }
                , $not: { $elemMatch: { user: user._id } }
            }
        }
        ,{ $set: { "chara.$.user": user._id}}
        ,{ strict: true, new: true}
    ).lean();
};

model.entryGuest = async (user, id, name) => {
    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").toDate();
    return this.schema.findOneAndUpdate(
        {
            owner: user._id
            ,start_at: { $gte: time }
            ,chara: {
                $elemMatch: { _id: id, user: null, guest: null }
            }
        }
        ,{ $set: { "chara.$.guest": name}}
        ,{ strict: true, new: true}
    ).lean();
};

model.cancelEntry = async (user, id) => {
    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").toDate();
    return this.schema.findOneAndUpdate(
        {
            start_at: { $gte: time }
            ,chara: { $elemMatch: { _id: id, user: user._id }}
        }
        ,{ $set: { "chara.$.user": null }}
        ,{ strict: true, new: true}
    ).lean();
};

model.cancelEntryByOwner = async (user, id) => {
    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").toDate();
    return this.schema.findOneAndUpdate(
        {
            owner: user._id
            ,start_at: { $gte: time }
            ,chara: { $elemMatch: { _id: id }}
        }
        ,{ $set: { "chara.$.user": null, "chara.$.guest": null }}
        ,{ strict: true, new: true}
    ).lean();
};

model.mvp = async (user, id) => {
    let session = null;
    let time = moment().add(-1 * C.RESERVE_EDIT_MINUTE, "minutes").toDate();

    return db.startSession()
    .then((_session) => {
        session = _session;
        session.startTransaction();

        return this.schema.findOneAndUpdate(
            {
                start_at: { $lt: time }
                ,chara: {
                    $elemMatch: { _id: id }
                    , $not: { $elemMatch: { mvp: user._id } }
                }
            }
            ,{ $push: { "chara.$.mvp": user._id}}
            ,{ strict: true, new: true, session: session}
        ).lean();
    })
    .then(async (reserve) => {
        if (!reserve) return reserve;

        // mvp先がユーザー登録ありか確認
        let mvpUserId = null;
        for (let c of reserve.chara) {
            if (!c.mvp || !c.mvp.includes(user._id)) continue;
            if (c.user) {
                mvpUserId = c.user;
                break;
            } else {
                return reserve;
            }
        }

        let ret = await User.model.incrementMvp(mvpUserId, session);
        if (!ret) {
            throw new Error();
        }
        return reserve;
    })
    .then(async (reserve) => {
        await session.commitTransaction();
        return reserve;
    })
    .finally(async () => {
        await session.endSession();
    })
    ;
};


module.exports.model = model;
