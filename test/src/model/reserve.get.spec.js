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
    ,public: true
    ,chara: [
        { name: "taro", sex:"m"}
        ,{ name: "hanako", sex:"f"}
        ,{ name: "nare", sex:"o"}
    ]
};

describe("reserve get", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("getNum", async () => {
        let tmp = [
            JSON.parse(JSON.stringify(reserve))
            ,JSON.parse(JSON.stringify(reserve))
            ,JSON.parse(JSON.stringify(reserve))
        ];

        tmp[0].scenario_title = "000";
        tmp[1].scenario_title = "001";
        tmp[2].scenario_title = "002";
        tmp[0].start_at = moment().add(-5, "minutes").toDate();
        tmp[1].public = false;

        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.get();
        expect(ret.length).toBe(2);
        expect(ret[0].scenario_title).toBe("002");
        expect(ret[1].scenario_title).toBe("000");
    });
});

describe("reserve getNum", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("getNum", async () => {
        let tmp = [
            JSON.parse(JSON.stringify(reserve))
            ,JSON.parse(JSON.stringify(reserve))
            ,JSON.parse(JSON.stringify(reserve))
        ];

        tmp[0].start_at = moment().add(-5, "minutes").toDate();
        tmp[1].start_at = moment().add(5, "minutes").toDate();
        tmp[2].start_at = moment().add(5, "minutes").toDate();
        tmp[2].owner = "200";

        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.getNum(user);
        expect(ret).toBe(1);
    });
});
