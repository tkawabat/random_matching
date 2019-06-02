"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const twitter = require(rootDir+"/src/twitter");
const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const Entry = require(rootDir+"/src/model/entry");
const Match = require(rootDir+"/src/model/match");
const matcher = require(rootDir+"/src/matcher");


let stubs = [];

let assertMatch = async (user, type, entries) => {
    return Promise.all([
        Match.model.get(user).then((ret) => {
            expect(type).toEqual(type);
            expect(entries).toEqual(entries);
        })
        ,Entry.schema.findOne({_id: user._id}).exec().then((entry) => {
            expect(entry).toBe(null);
        })
    ]);
}

let assertNotMatch = async (id) => {
    return Promise.all([
        Match.model.get({_id: id}).then((ret) => {
            expect(ret).toBe(null);
        })
        ,Entry.schema.findOne({_id: id}).exec().then((entry) => {
            expect(entry._id).toEqual(id);
        })
    ]);
}

describe("machter dbあり", () => {

    beforeEach(async () => {
        stubs.push(sinon.stub(twitter, "sendDm"));
        await Promise.all([
            Match.schema.deleteMany().exec()
            ,Entry.schema.deleteMany().exec()
        ]);
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("2マッチ成功", async () => {
        let entries = [
            {_id: 100, type: ["act2"], tags: ["aaa", "bbb"]}
            , {_id: 101, type: ["act2"]}
        ]
        await Entry.schema.insertMany(entries);

        await matcher.match("act2");

        assertMatch("100", "act2", entries)
        assertMatch("101", "act2", entries)
    });

    it("2マッチ失敗 type違い", async () => {
        let entries = [
            {_id: 100, type: ["act2"]}
            ,{_id: 101, type: ["act3_7"]}
        ];
        await Entry.schema.insertMany(entries);

        await matcher.match("act2");

        await Promise.all([
            assertNotMatch("100")
            ,assertNotMatch("101")
        ]);
    });

    it("3:1マッチ成功1人あまり", async () => {
        let entries = [
            {_id: 100, type: ["act3_7"]}
            ,{_id: 101, type: ["act3_7"]}
            ,{_id: 102, type: ["act3_7"]}
            ,{_id: 103, type: ["act3_7"]}
            ,{_id: 200, type: ["act3_7"]}
        ];
        await Entry.schema.insertMany(entries);

        await matcher.match("act3_7");

        await Promise.all([
            assertNotMatch("103")
            ,assertMatch("100", "act3_7", entries)
            ,assertMatch("101", "act3_7", entries)
            ,assertMatch("102", "act3_7", entries)
            ,assertMatch("200", "act3_7", entries)
        ]);
    });

    it("3マッチ失敗 type違い", async () => {
        let entries = [
            {_id: 100, type: ["act3_7"]}
            ,{_id: 101, type: ["act3_7"]}
            ,{_id: 102, type: ["act2"]}
        ];
        await Entry.schema.insertMany(entries);

        await matcher.match("act3_7");

        await Promise.all([
            assertNotMatch("100")
            ,assertNotMatch("101")
            ,assertNotMatch("102")
        ]);
    });

});

describe("machter dbあり matchEvent", () => {

    beforeEach(async () => {
        await Promise.all([
            Match.schema.deleteMany().exec()
            ,Entry.schema.deleteMany().exec()
        ]);
        stubs.push(sinon.stub(twitter, "sendDm"));
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("2:2エントリー　1:1台本", async () => {
        let entries = [
            {_id: 100, type: ["event"]}
            ,{_id: 101, type: ["event"]}
            ,{_id: 200, type: ["event"]}
            ,{_id: 201, type: ["event"]}
        ];
        await Entry.schema.insertMany(entries);

        let scenario = {
            title: ""
            ,chara: [
                {sex: "f"}
                ,{sex: "m"}
            ]
        };
        let event = {
            title: ""
            ,scenario: scenario
        }
        await matcher.matchEvent(event);

        let match;
        let entry;

        await Promise.all([
            ,assertMatch("100", "event", entries)
            ,assertMatch("101", "event", entries)
            ,assertMatch("200", "event", entries)
            ,assertMatch("201", "event", entries)
        ]);
    });

    it("3:1エントリー　1:1台本", async () => {
        let entries = [
            {_id: 100, type: ["event"]}
            ,{_id: 101, type: ["event"]}
            ,{_id: 200, type: ["event"]}
            ,{_id: 102, type: ["event"]}
        ];
        await Entry.schema.insertMany(entries);

        let scenario = {
            title: ""
            ,chara: [
                {sex: "f"}
                ,{sex: "m"}
            ]
        };
        let event = {
            title: ""
            ,scenario: scenario
        }
        await matcher.matchEvent(event);

        let match;
        let entry;

        await Promise.all([
            assertNotMatch("101")
            ,assertNotMatch("102")
            ,assertMatch("100", "event", entries)
            ,assertMatch("200", "event", entries)
        ]);
    });

    it("2マッチ失敗 type違い", async () => {
        let entries = [
            {_id: 100, type: ["event"]}
            ,{_id: 200, type: ["act2"]}
        ];
        await Entry.schema.insertMany(entries);
        let scenario = {
            title: ""
            ,chara: [
                {sex: "f"}
                ,{sex: "m"}
            ]
        };
        let event = {
            title: ""
            ,scenario: scenario
        }
        await matcher.matchEvent(event);

        await Promise.all([
            assertNotMatch("100")
            ,assertNotMatch("200")
        ]);
    });

    it("4:2エントリー　3:1台本", async () => {
        let entries = [
             {_id: 100, type: ["event"]}
            ,{_id: 101, type: ["event"]}
            ,{_id: 102, type: ["event"]}
            ,{_id: 103, type: ["event"]}
            ,{_id: 200, type: ["event"]}
            ,{_id: 201, type: ["event"]}
            ,{_id: 202, type: ["event"]}
        ];
        await Entry.schema.insertMany(entries);

        let scenario = {
            title: ""
            ,chara: [
                {sex: "f"}
                ,{sex: "m"}
                ,{sex: "f"}
                ,{sex: "f"}
            ]
        };
        let event = {
            title: ""
            ,scenario: scenario
        }
        await matcher.matchEvent(event);

        await Promise.all([
            assertNotMatch("103")
            ,assertNotMatch("201")
            ,assertNotMatch("202")
            ,assertMatch("100", "event", entries)
            ,assertMatch("101", "event", entries)
            ,assertMatch("102", "event", entries)
            ,assertMatch("200", "event", entries)
        ]);
    });
});
