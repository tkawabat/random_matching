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

before((done) => {
    db.connection.once("open", async () => {
        await Match.deleteMany().exec();
        done();
    });
});

beforeEach(() => {
    mockMatcher = sinon.mock(matcher);
});

afterEach(() => {
    mockMatcher.restore();
});

after(() => {
    db.disconnect();
});

it("3:1マッチ成功1人あまり", async () => {
    await Entry.deleteMany().exec();
    await Entry.insertMany([
        {_id: 100}
        ,{_id: 101}
        ,{_id: 102}
        ,{_id: 103}
        ,{_id: 200}
    ]);

    await matcher.matchAct([4]);

    let match;
    match = await Match.findOne({_id: 100}).exec();
    expect(match.ids).toEqual(["100", "101", "102", "200"]);
    match = await Match.findOne({_id: 101}).exec();
    expect(match.ids).toEqual(["100", "101", "102", "200"]);
    match = await Match.findOne({_id: 102}).exec();
    expect(match.ids).toEqual(["100", "101", "102", "200"]);
    match = await Match.findOne({_id: 103}).exec();
    expect(match.ids).toEqual(["103"]); // ぼっち・・・
    match = await Match.findOne({_id: 200}).exec();
    expect(match.ids).toEqual(["100", "101", "102", "200"]);
});
