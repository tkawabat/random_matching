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
};
let reserve = {
    owner: "100"
    ,scenario: scenario_id
    ,scenario_title: "aaa"
    ,minutes: 60
    ,start_at: moment().toDate()
    ,place: "skype"
    ,public: false
    ,chara: [
        { name: "taro", sex:"m"}
        ,{ name: "hanako", sex:"f"}
        ,{ name: "nare", sex:"o"}
        ,{ name: "xxxx", sex:"o"}
    ]
};

describe("reserve update", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("新規", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        let ret = await Reserve.model.update(tmp, user);
        expect(ret.scenario_title).toBe("aaa");
    });

    it("更新", async () => {
        let old = JSON.parse(JSON.stringify(reserve));
        old.chara[0].user = "100";
        old.chara[1].guest = "guest001";
        old.chara[2].user = "101";
        old.chara[3].guest = "guest001";
        let ret = await Reserve.model.update(old, user);

        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp._id = ret._id;
        tmp.chara[2].sex = "m";
        tmp.chara[3].name = "yyyy";
        ret = await Reserve.model.update(tmp, user);

        expect(ret.chara[0].user).toBe("100");
        expect(ret.chara[1].guest).toBe("guest001");
        expect(ret.chara[2].user).toBe(undefined);
        expect(ret.chara[3].guest).toBe(undefined);
    });

    it("更新失敗 id違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        let ret = await Reserve.model.update(tmp, user);

        tmp = JSON.parse(JSON.stringify(ret));
        tmp._id = new db.Types.ObjectId;
        tmp.scenario_title = "bbb";
        ret = await Reserve.model.update(tmp, user);

        expect(ret).toBe(null);
    });

    it("更新失敗 ユーザー違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        let ret = await Reserve.model.update(tmp, user);

        tmp = JSON.parse(JSON.stringify(ret));
        let tmpUser = JSON.parse(JSON.stringify(user));
        tmp.scenario_title = "bbb";
        tmpUser._id = "200";
        ret = await Reserve.model.update(tmp, tmpUser);

        expect(ret).toBe(null);
    });

    it("更新失敗 上演後", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().add(-30, "minutes").toDate();
        let ret = await Reserve.model.update(tmp, user);

        tmp = JSON.parse(JSON.stringify(ret));
        let tmpUser = JSON.parse(JSON.stringify(user));
        tmp.scenario_title = "bbb";
        ret = await Reserve.model.update(tmp, tmpUser);

        expect(ret).toBe(null);
    });

});
