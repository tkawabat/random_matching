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

describe("machter dbあり", () => {

    beforeEach(() => {
        stubs.push(sinon.stub(twitter, "sendDm"));
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("3:1マッチ成功1人あまり", async () => {
        await Match.schema.deleteMany().exec();
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100}
            ,{_id: 101}
            ,{_id: 102}
            ,{_id: 103}
            ,{_id: 200}
        ]);

        await matcher.matchAct([4]);

        let match;
        match = await Match.schema.findOne({_id: 100}).exec();
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
        match = await Match.schema.findOne({_id: 101}).exec();
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
        match = await Match.schema.findOne({_id: 102}).exec();
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
        match = await Match.schema.findOne({_id: 200}).exec();
        expect(match.ids).toEqual(["100", "101", "102", "200"]);

        // 失敗
        let entry;
        match = await Match.schema.findOne({_id: 103}).exec();
        expect(match).toBe(null);
        entry = await Entry.schema.findOne({_id: 103}).exec();
        expect(entry._id).toEqual("103");
    });

});
