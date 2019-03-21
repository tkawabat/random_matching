"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
const matcher = require(rootDir+"/src/matcher");


let mockMacher;

beforeEach(() => {
    mockMacher = sinon.mock(matcher);
});

afterEach(() => {
    mockMacher.restore();
});

after(() => {
    db.disconnect();
});

it("2マッチ成功", () => {
    let entries = [
        { "_id": { "_id": 0, "sex": "m" } }
        ,{ "_id": { "_id": 1, "sex": "m" } }
    ];

    //mockMacher.expects("matched").once().withArgs([
    //    { "_id": 0, "sex": "m" }
    //    ,{ "_id": 1, "sex": "m" }
    //]);

    let actual = matcher.findMatch(entries, 2);

    expect(actual).toEqual([
        { "_id": 0, "sex": "m" }
        ,{ "_id": 1, "sex": "m" }
    ]);
});

it("2マッチ人数不足", () => {
    let entries = [
        { "_id": { "_id": 0, "sex": "m" } }
    ];

    let actual = matcher.findMatch(entries, 2);

    expect(actual).toEqual([]);
});

it("3マッチ成功", () => {
    let entries = [
        { "_id": { "_id": 0, "sex": "m" } }
        ,{ "_id": { "_id": 1, "sex": "m" } }
        ,{ "_id": { "_id": 2, "sex": "m" } }
    ];

    let actual = matcher.findMatch(entries, 3);

    expect(actual).toEqual([
        { "_id": 0, "sex": "m" }
        ,{ "_id": 1, "sex": "m" }
        ,{ "_id": 2, "sex": "m" }
    ]);
});

it("4マッチひとりあまり", () => {
    let entries = [
        { "_id": { "_id": 0, "sex": "m" } }
        ,{ "_id": { "_id": 1, "sex": "m" } }
        ,{ "_id": { "_id": 2, "sex": "m" } }
        ,{ "_id": { "_id": 3, "sex": "m" } }
        ,{ "_id": { "_id": 4, "sex": "f" } }
    ];

    let actual = matcher.findMatch(entries, 4);

    expect(actual).toEqual([
        { "_id": 0, "sex": "m" }
        ,{ "_id": 1, "sex": "m" }
        ,{ "_id": 2, "sex": "m" }
        ,{ "_id": 4, "sex": "f" }
    ]);
});

it("5マッチ失敗1:4", () => {
    let entries = [
        { "_id": { "_id": 0, "sex": "m" } }
        ,{ "_id": { "_id": 1, "sex": "f" } }
        ,{ "_id": { "_id": 2, "sex": "f" } }
        ,{ "_id": { "_id": 3, "sex": "f" } }
        ,{ "_id": { "_id": 4, "sex": "f" } }
    ];

    let actual = matcher.findMatch(entries, 5);

    expect(actual).toEqual([]);
});
