"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
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
    ,start_at: moment().toDate()
    ,public: false
    ,place: "skype"
    ,chara: [
        { _id: new db.Types.ObjectId, name: "taro", sex:"m"}
        ,{ _id: new db.Types.ObjectId, name: "hanako", sex:"f"}
        ,{ _id: new db.Types.ObjectId, name: "nare", sex:"o"}
    ]
};

describe("reserve entry", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("データなし", async () => {
        let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗　開始時間", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().add(-30, "minutes").toDate();
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("成功　男性", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[2].user = "200"; // 他が埋まっていても関係ない
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
        expect(ret.chara[0].user).toBe("100");
    });

    it("失敗　女性", async () => {
        await Reserve.schema.insertMany(reserve);

        let ret = await Reserve.model.entry(user, reserve.chara[1]._id);
        expect(ret).toBe(null);
    });

    it("成功　不問", async () => {
        await Reserve.schema.insertMany(reserve);

        let ret = await Reserve.model.entry(user, reserve.chara[2]._id);
        expect(ret.chara[2].user).toBe("100");
    });

    it("失敗　埋まっている", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "200";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗　ゲストで埋まっている", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].guest = "guest001";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗　別キャラにエントリー済み", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[2].user = "100";
        await Reserve.schema.insertMany(tmp).catch((err) => { console.log(err)});

        let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

});

describe("reserve entry guest", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("データなし", async () => {
        let ret = await Reserve.model.entry({_id: "200"}, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("成功", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entryGuest({_id: "200"}, reserve.chara[0]._id, "guest001");
        expect(ret.chara[0].guest).toBe("guest001");
    });

    it("失敗　開始時間", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().add(-30, "minutes").toDate();
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entryGuest({_id: "200"}, reserve.chara[0]._id, "guest001");
        expect(ret).toBe(null);
    });

    it("失敗　オーナーじゃない", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entryGuest({_id: "100"}, reserve.chara[0]._id, "guest001");
        expect(ret).toBe(null);
   });

    it("失敗　埋まっている", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entryGuest({_id: "200"}, reserve.chara[0]._id, "guest001");
        expect(ret).toBe(null);
    });

    it("失敗　ゲストで埋まっている", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].guest = "guest999";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.entryGuest({_id: "200"}, reserve.chara[0]._id, "guest001");
        expect(ret).toBe(null);
    });

});

describe("reserve cancel entry", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("失敗 データなし", async () => {
        let ret = await Reserve.model.cancelEntry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗 user違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "200";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗 id違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[2].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntry(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗　開始時間", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().add(-30, "minutes").toDate();
        tmp.chara[2].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntry(user, reserve.chara[2]._id);
        expect(ret).toBe(null);
    });

    it("成功", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[2].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntry(user, reserve.chara[2]._id);
        expect(ret.chara[2].user).toBe(null);
    });

});

describe("reserve cancel entry by owner", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("失敗 データなし", async () => {
        let ret = await Reserve.model.cancelEntryByOwner(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗 ownerじゃない", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntryByOwner(user, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("失敗　開始時間", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().add(-30, "minutes").toDate();
        tmp.chara[0].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntryByOwner({_id: "200"}, reserve.chara[0]._id);
        expect(ret).toBe(null);
    });

    it("成功 ユーザー削除", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "100";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntryByOwner({_id: "200"}, reserve.chara[0]._id);
        expect(ret.chara[0].user).toBe(null);
    });

    it("成功 別ユーザーが消えない", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "100";
        tmp.chara[2].user = "101";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntryByOwner({_id: "200"}, reserve.chara[0]._id);
        expect(ret.chara[2].user).toBe("101");
    });

    it("成功 ゲスト削除", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].guest = "guest001";
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.cancelEntryByOwner({_id: "200"}, reserve.chara[0]._id);
        expect(ret.chara[0].guest).toBe(null);
    });
});

