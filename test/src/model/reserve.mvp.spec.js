"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const Reserve = require(rootDir+"/src/model/reserve");
const cache = require(rootDir + "/src/cache");


let id = new db.Types.ObjectId;
let scenario_id = new db.Types.ObjectId;

let user = {
    _id: "100"
    ,sex: "m"
};
let reserve = {
    _id: id
    ,owner: "200"
    ,scenario: scenario_id
    ,start_at: moment().add(-31, "minutes").toDate()
    ,public: false
    ,place: "skype"
    ,chara: [
        { _id: new db.Types.ObjectId, name: "taro", sex:"m"}
        ,{ _id: new db.Types.ObjectId, name: "hanako", sex:"f"}
        ,{ _id: new db.Types.ObjectId, name: "nare", sex:"o"}
    ]
};

describe("reserve mvp", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("失敗　データなし", async () => {
        let ret = await Reserve.model.mvp(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("成功", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.mvp(user, reserve.chara[0]._id);
        expect(ret.chara[0].mvp.length).toBe(1);
        expect(ret.chara[0].mvp[0]).toBe("100");
    });

    it("成功 追加", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].mvp = ["200"];
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.mvp(user, reserve.chara[0]._id);
        expect(ret.chara[0].mvp.length).toBe(2);
        expect(ret.chara[0].mvp[0]).toBe("200");
        expect(ret.chara[0].mvp[1]).toBe("100");
    });

    it("成功 user", async () => {
        let userId = "999999"
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = userId;
        await User.schema.deleteOne({_id: userId});
        await Promise.all([
            Reserve.schema.insertMany(tmp)
            ,User.schema.insertMany([{ _id: userId }])
        ]);

        await Reserve.model.mvp(user, reserve.chara[0]._id);

        let ret = await User.schema.findOne({_id: userId }).exec();
        expect(ret.mvp).toBe(1);
    });

    it("失敗　開始時間", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().toDate();
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.mvp(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗　別キャラにエントリー済み", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[2].mvp = ["200", "100"];
        await Reserve.schema.insertMany(tmp).catch((err) => { console.log(err)});

        let ret = await Reserve.model.mvp(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

});

