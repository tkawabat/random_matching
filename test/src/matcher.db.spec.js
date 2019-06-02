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

let assertMatch = async (user, type, matched) => {
    return Promise.all([
        Match.model.get(user).then((ret) => {
            expect(ret.type).toEqual(type);
            expect(ret.matched.length).toEqual(matched.length);
            for (let i = 0; i < matched.length; i++) {
                expect(ret.matched[i].user._id).toEqual(matched[i]._id);
                expect(ret.matched[i].tags).toEqual(matched[i].tags);
            }
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
            , {_id: 101, type: ["act2"], tags: []}
        ]
        await Entry.schema.insertMany(entries);

        await matcher.match("act2");

        await Promise.all([
            assertMatch("100", "act2", entries)
            , assertMatch("101", "act2", entries)
        ]);
    });

    it("2マッチ失敗 type違い", async () => {
        let entries = [
            {_id: 100, type: ["act2"], tags: []}
            ,{_id: 101, type: ["act3_7"], tags: []}
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
            {_id: 100, type: ["act3_7"], tags: []}
            ,{_id: 101, type: ["act3_7"], tags: []}
            ,{_id: 102, type: ["act3_7"], tags: []}
            ,{_id: 103, type: ["act3_7"], tags: []}
            ,{_id: 200, type: ["act3_7"], tags: []}
        ];
        await Entry.schema.insertMany(entries);

        await matcher.match("act3_7");

        entries.splice(3, 1);

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
            {_id: 100, type: ["act3_7"], tags: []}
            ,{_id: 101, type: ["act3_7"], tags: []}
            ,{_id: 102, type: ["act2"], tags: []}
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
        let entry0 = {_id: 100, type: ["event"], tags: []};
        let entry1 = {_id: 101, type: ["event"], tags: []};
        let entry2 = {_id: 200, type: ["event"], tags: []};
        let entry3 = {_id: 201, type: ["event"], tags: []};
        let entries = [entry0, entry1, entry2, entry3];
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
            ,assertMatch("100", "event", [entry0, entry2])
            ,assertMatch("101", "event", [entry1, entry3])
            ,assertMatch("200", "event", [entry0, entry2])
            ,assertMatch("201", "event", [entry1, entry3])
        ]);
    });

    it("3:1エントリー　1:1台本", async () => {
        let entries = [
            {_id: 100, type: ["event"], tags: []}
            ,{_id: 101, type: ["event"], tags: []}
            ,{_id: 200, type: ["event"], tags: []}
            ,{_id: 102, type: ["event"], tags: []}
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

        entries.splice(3, 1);
        entries.splice(1, 1);

        await Promise.all([
            assertNotMatch("101")
            ,assertNotMatch("102")
            ,assertMatch("100", "event", entries)
            ,assertMatch("200", "event", entries)
        ]);
    });

    it("2マッチ失敗 type違い", async () => {
        let entries = [
            {_id: 100, type: ["event"], tags: []}
            ,{_id: 200, type: ["act2"], tags: []}
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
             {_id: 100, type: ["event"], tags: []}
            ,{_id: 101, type: ["event"], tags: []}
            ,{_id: 102, type: ["event"], tags: []}
            ,{_id: 103, type: ["event"], tags: []}
            ,{_id: 200, type: ["event"], tags: []}
            ,{_id: 201, type: ["event"], tags: []}
            ,{_id: 202, type: ["event"], tags: []}
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

        entries.splice(6, 1);
        entries.splice(5, 1);
        entries.splice(3, 1);

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
