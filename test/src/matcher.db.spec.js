"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const Entry = require(rootDir+"/src/model/entry");
const Match = require(rootDir+"/src/model/match");
const matcher = require(rootDir+"/src/matcher");


let mockMatcher;

beforeEach(() => {
    mockMatcher = sinon.mock(matcher);
});

afterEach(() => {
    mockMatcher.restore();
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

    Match.schema.findOne({_id: 100}, (err, match) => {
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
    });
    Match.schema.findOne({_id: 101}, (err, match) => {
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
    });
    Match.schema.findOne({_id: 102}, (err, match) => {
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
    });
    Match.schema.findOne({_id: 103}, (err, match) => {
        expect(match).toBe(null);
    });
    Match.schema.findOne({_id: 200}, (err, match) => {
        expect(match.ids).toEqual(["100", "101", "102", "200"]);
    });

    Entry.schema.findOne({_id: 100}, (err, entry) => {
        expect(entry).toBe(null);
    });
    Entry.schema.findOne({_id: 103}, (err, entry) => {
        expect(entry._id).toEqual("103");
    });
});
