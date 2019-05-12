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
    ]
};

describe("reserve update", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("新規", async () => {
        let ret = await Reserve.model.update(reserve, user);
        expect(ret.scenario_title).toBe("aaa");
    });

    it("更新", async () => {
        let ret = await Reserve.model.update(reserve, user);

        let tmp = JSON.parse(JSON.stringify(ret));
        tmp.scenario_title = "bbb";
        ret = await Reserve.model.update(tmp, user);

        expect(ret.scenario_title).toBe("bbb");
    });

    it("更新失敗 ユーザー違い", async () => {
        let ret = await Reserve.model.update(reserve, user);

        let tmp = JSON.parse(JSON.stringify(ret));
        let tmpUser = JSON.parse(JSON.stringify(user));
        tmp.scenario_title = "bbb";
        tmpUser._id = "200";
        ret = await Reserve.model.update(tmp, tmpUser);

        expect(ret).toBe(null);
    });

    //it("成功　男性", async () => {
    //    let tmp = JSON.parse(JSON.stringify(reserve));
    //    tmp.chara[2].user = "200";
    //    await Reserve.schema.insertMany(tmp);

    //    let ret = await Reserve.model.entry(user, reserve.chara[0]._id);
    //    expect(ret.chara[0].user).toBe("100");
    //});
});
