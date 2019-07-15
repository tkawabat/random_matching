"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const expect = require("expect");
const sinon = require("sinon");

const schedule = require(rootDir+"/src/schedule");
const twitter = require(rootDir+"/src/twitter");
const entryHelper = require(rootDir+"/src/entryHelper");
const matcher = require(rootDir+"/src/matcher");
const Match = require(rootDir+"/src/model/match");
const Entry = require(rootDir+"/src/model/entry");


let stubs = [];

describe("entryHelper get", () => {
    let userId = "100";
    let req, res;
    beforeEach(async () => {
        req = {
            user: { _id: userId}
        };
        res = {
            viewParam: {}
        };
        await Promise.all([
            Match.schema.deleteMany().exec()
            , Entry.schema.deleteMany().exec()
        ]);
    });

    it("null", async () => {
        await entryHelper.get(req, res, () => {});

        expect(res.viewParam.match).toBe(null);
        expect(res.viewParam.entry).toBe(null);
    });

    it("ok", async () => {
        // 本来はありえないけど、entryとmatch両方にレコードがある
        let match = {
            type: "act2"
            , matched: [
                {user: "100", tags: ["aaa", "bbb"]}
                , {user: "101", tags: []}
            ]
        };
        let entry = {
            _id: userId
            , type: ["act3_7"]
            , tags: ["ccc", "ddd"]
        }
        await Promise.all([
            Match.schema.insertMany([match])
            ,Entry.schema.insertMany([entry])

        ]);

        await entryHelper.get(req, res, () => {});

        let actual = {
            type: res.viewParam.match.type
            , matched: []
        }
        delete res.viewParam.match._id;
        for (let i = 0; i < res.viewParam.match.matched.length; i++) {
            let obj = {
                user: res.viewParam.match.matched[i].user._id
                , tags: res.viewParam.match.matched[i].tags
            }
            actual.matched.push(obj);
        }
        expect(actual).toEqual(match);

        actual = {
            _id: res.viewParam.entry._id._id
            , type: res.viewParam.entry.type
            , tags: res.viewParam.entry.tags
        }
        expect(actual).toEqual(entry);
    });
});

describe("entryHelper pushScheduleMatch", () => {
    let mock;

    before(() => {
        stubs.push(sinon.stub(matcher, "match"));
        stubs.push(sinon.stub(twitter, "tweet"));
    });
    beforeEach(() => {
        mock = sinon.mock(schedule);
    });
    afterEach(() => {
        mock.restore();
    });
    after(() => {
        for (let s of stubs) s.restore();
    });

    it("ng type invalid", async () => {
        let entry = { type: ["act2"] };
        mock.expects("push").never();
        entryHelper.pushScheduleMatch(entry);
        mock.verify();
    });

    it("ng already scheduled", async () => {
        let entry = { type: ["act3_7"] };
        let time = moment().add(30, "minutes");
        schedule.push("match_2_act3_7", true, time.toDate(), () => {});

        mock.expects("push").never();
        entryHelper.pushScheduleMatch(entry);
        mock.verify();

        schedule.cancel("match_2_act3_7");
    });

    it("ok", async () => {
        let entry = { type: ["act3_7"] };
        mock.expects("push").exactly(3);
        entryHelper.pushScheduleMatch(entry);
        mock.verify();
    });

});
