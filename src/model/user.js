"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");

const db = require(rootDir+"/src/mongodb");
const logger = require(rootDir+"/src/log4js");
const cache = require(rootDir+"/src/cache");

const cachePrefix = "db_user_";

const schema = db.Schema({
    _id: { type: String }
    ,twitter_token: { type: String}
    ,twitter_token_secret: { type: String}
    ,twitter_id: { type: String }
    ,twitter_name: { type: String }
    ,twitter_created_at: { type: Date }
    ,skype_id: { type: String }
    ,sex: { type: String }
    ,image_url_https: { type: String }
    ,ng_list: [{ type: String }]
    ,push: {
        match: {type: Boolean, default: true }
    }
},
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);


module.exports.model = {};
module.exports.model.get = (id, done) => {
    cache.get(cachePrefix+id, (err, value) => {
        if (!err && value) {
            let user = new this.schema(value);
            done(null, user);
            return;
        }

        this.schema.findById(id, (err, user) => {
            if (!err && user) {
                cache.set(cachePrefix+user._id, user);
            }
            done(err, user);
        });
    });
}

module.exports.model.set = (user, done) => {
    this.schema.findOneAndUpdate({"_id": user._id}, user, {upsert: true, new: true}, (err, user) => {
        if (err) {
            logger.error(err);
        }
        if (!err && user) {
            cache.del(cachePrefix+user._id);
        }

        done(err, user);
    });
}

module.exports.model.isSafeTwitter = (user) => {
    if (!user.twitter_created_at) {
        return false;
    }
    let diff = new Date().getTime() - user.twitter_created_at.getTime();
    if (diff / 1000 < 60 * 60 * 24 * 180) {
        return false;
    }

    return true;
}

module.exports.model.isReady = (user) => {
    return user.sex && user.skype_id && this.model.isSafeTwitter(user);
}

module.exports.schema = db.model("user", schema);
