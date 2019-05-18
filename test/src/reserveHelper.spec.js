"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const db = require(rootDir+"/src/mongodb");
const User = require(rootDir + "/src/model/user");
const Scenario = require(rootDir + "/src/model/scenario");
const Reserve = require(rootDir + "/src/model/reserve");
const reserveHelper = require(rootDir+"/src/reserveHelper");
const twitter = require(rootDir+"/src/twitter");


let id = new db.Types.ObjectId;
let scenario_id = new db.Types.ObjectId;

let chara = [
    { _id: new db.Types.ObjectId, name: "taro", sex:"m"}
    ,{ _id: new db.Types.ObjectId, name: "hanako", sex:"f"}
    ,{ _id: new db.Types.ObjectId, name: "nare", sex:"o"}
];

describe("reserve helper get", () => {
    let scenario = {
        _id: scenario_id
        ,author: "さくしゃ"
        ,chara: chara
    };

    let reserve = {
        _id: id
        ,owner: "100"
        ,scenario: scenario_id
        ,start_at: moment().toDate()
        ,public: false
        ,place: "skype"
        ,chara: chara
    };

    it("update get", async () => {
        await Promise.all([
            Reserve.schema.deleteMany().exec()
            , Scenario.schema.deleteMany().exec()
        ]);

        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.chara[0].user = "101";
        tmp.chara[1].guest = "guest001";
        await Promise.all([
            Reserve.schema.insertMany([tmp])
            ,Scenario.schema.insertMany([scenario])
        ]);

        let req = {
            params: { reserve_id: id}
        };
        let res = {
            viewParam: {}
        };
        await reserveHelper.get(req, res, () => {});

        expect(res.viewParam.reserve._id).toEqual(id);
        expect(res.viewParam.reserve.owner.twitter_name).toEqual("f0");
        expect(res.viewParam.reserve.scenario.author).toEqual("さくしゃ");
        expect(res.viewParam.reserve.chara[0].user.twitter_name).toEqual("f1");
        expect(res.viewParam.reserve.chara[1].user.twitter_name).toEqual("guest001");
        expect(res.viewParam.reserve.chara[1].user.image_url_https).toEqual("https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png");
    });
});
 
describe("reserve helper tweetCreated", () => {
    let mock;
    let reserve = {
        _id: id
        ,owner: "100"
        ,scenario: scenario_id
        ,start_at: moment().toDate()
        ,public: true
        ,place: "skype"
        ,chara: chara
    };

    beforeEach(async () => {
        await Promise.all([
            Reserve.schema.deleteMany().exec()
        ]);
        mock = sinon.mock(twitter);
    });

    afterEach(() => {
        mock.restore();
    });

    it("ok", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Promise.all([
            Reserve.schema.insertMany([tmp])
        ]);

        mock.expects("tweet").once();

        await reserveHelper.tweetCreated(id);

        mock.verify();
    });

    it("ng id違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Promise.all([
            Reserve.schema.insertMany([tmp])
        ]);

        mock.expects("tweet").never();

        await reserveHelper.tweetCreated(new db.Types.ObjectId);

        mock.verify();
    });

    it("ng public false", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        reserve.public = true;
        await Promise.all([
            Reserve.schema.insertMany([tmp])
        ]);

        mock.expects("tweet").never();

        await reserveHelper.tweetCreated(new db.Types.ObjectId);

        mock.verify();
    });
});
