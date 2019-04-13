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

let assertMatch = async (id, type, ids) => {
    let match = await Match.schema.findOne({_id: id}).exec();
    let entry = await Entry.schema.findOne({_id: id}).exec();
    expect(match.ids).toEqual(ids);
    expect(match.type).toEqual(type);
    expect(entry).toBe(null);
}

let assertNotMatch = async (id) => {
    let match = await Match.schema.findOne({_id: id}).exec();
    let entry = await Entry.schema.findOne({_id: id}).exec();
    expect(match).toBe(null);
    expect(entry._id).toEqual(id);
}

describe("machter dbあり", () => {

    beforeEach(() => {
        stubs.push(sinon.stub(twitter, "sendDm"));
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("2マッチ成功", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["act2"]}
            ,{_id: 101, type: ["act2"]}
        ]);

        await matcher.match("act2");

        let match;
        let entry;

        await assertMatch("100", "act2", ["100", "101"]);
        await assertMatch("101", "act2", ["100", "101"]);
    });

    it("2マッチ失敗 type違い", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["act2"]}
            ,{_id: 101, type: ["act3_7"]}
        ]);

        await matcher.match("act2");

        await assertNotMatch("100");
        await assertNotMatch("101");
    });

    it("3:1マッチ成功1人あまり", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["act3_7"]}
            ,{_id: 101, type: ["act3_7"]}
            ,{_id: 102, type: ["act3_7"]}
            ,{_id: 103, type: ["act3_7"]}
            ,{_id: 200, type: ["act3_7"]}
        ]);

        await matcher.match("act3_7");

        await assertNotMatch("103");
        await assertMatch("100", "act3_7", ["100", "101", "102", "200"]);
        await assertMatch("101", "act3_7", ["100", "101", "102", "200"]);
        await assertMatch("102", "act3_7", ["100", "101", "102", "200"]);
        await assertMatch("200", "act3_7", ["100", "101", "102", "200"]);
    });

    it("3マッチ失敗 type違い", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["act3_7"]}
            ,{_id: 101, type: ["act3_7"]}
            ,{_id: 102, type: ["act2"]}
        ]);

        await matcher.match("act3_7");

        await assertNotMatch("100");
        await assertNotMatch("101");
        await assertNotMatch("102");
    });

});

describe("machter dbあり matchEvent", () => {

    beforeEach(() => {
        stubs.push(sinon.stub(twitter, "sendDm"));
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("2:2エントリー　1:1台本", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["event"]}
            ,{_id: 101, type: ["event"]}
            ,{_id: 200, type: ["event"]}
            ,{_id: 201, type: ["event"]}
        ]);

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

        await assertMatch("100", "event", ["100", "200"]);
        await assertMatch("101", "event", ["101", "201"]);
        await assertMatch("200", "event", ["100", "200"]);
        await assertMatch("201", "event", ["101", "201"]);
    });

    it("3:1エントリー　1:1台本", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["event"]}
            ,{_id: 101, type: ["event"]}
            ,{_id: 200, type: ["event"]}
            ,{_id: 102, type: ["event"]}
        ]);

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

        await assertNotMatch("101");
        await assertNotMatch("102");
        await assertMatch("100", "event", ["100", "200"]);
        await assertMatch("200", "event", ["100", "200"]);
    });

    it("2マッチ失敗 type違い", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: ["event"]}
            ,{_id: 200, type: ["act2"]}
        ]);
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

        await assertNotMatch("100");
        await assertNotMatch("200");
    });

    it("4:2エントリー　3:1台本", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
             {_id: 100, type: ["event"]}
            ,{_id: 101, type: ["event"]}
            ,{_id: 102, type: ["event"]}
            ,{_id: 103, type: ["event"]}
            ,{_id: 200, type: ["event"]}
            ,{_id: 201, type: ["event"]}
            ,{_id: 202, type: ["event"]}
        ]);

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

        await assertNotMatch("103");
        await assertNotMatch("201");
        await assertNotMatch("202");
        await assertMatch("100", "event", ["100", "101", "102", "200"]);
        await assertMatch("101", "event", ["100", "101", "102", "200"]);
        await assertMatch("102", "event", ["100", "101", "102", "200"]);
        await assertMatch("200", "event", ["100", "101", "102", "200"]);
    });
});
