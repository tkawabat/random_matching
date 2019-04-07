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

let assertMatch = async (id, ids) => {
    let match = await Match.schema.findOne({_id: id}).exec();
    let entry = await Entry.schema.findOne({_id: id}).exec();
    expect(match.ids).toEqual(ids);
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

        await assertMatch("100", ["100", "101"]);
        await assertMatch("101", ["100", "101"]);
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

        await assertMatch("100", ["100", "101", "102", "200"]);
        await assertMatch("101", ["100", "101", "102", "200"]);
        await assertMatch("102", ["100", "101", "102", "200"]);
        await assertNotMatch("103");
        await assertMatch("200", ["100", "101", "102", "200"]);
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
