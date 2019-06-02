"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const twitter = require(rootDir+"/src/twitter");
const matcher = require(rootDir+"/src/matcher");
const Entry = require(rootDir+"/src/model/entry");
const Match = require(rootDir+"/src/model/match");


let stubs = [];

describe("machter dbなし", () => {

    beforeEach(() => {
        stubs.push(sinon.stub(Entry.schema, "findOneAndUpdate"));
        stubs.push(sinon.stub(Match.schema, "insertMany"));
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });

    it("2マッチ成功", () => {
        let entry1 = {
            _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] }
            , tags: ["aaa"]
        }
        let entry2 = {
            _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] }
        }
        let entries = [entry1, entry2];

        let actual = matcher.findMatch(entries, 2, {"m": 2, "f": 2});

        expect(actual).toEqual([entry1, entry2]);
    });

    it("2マッチ人数不足", () => {
        let entry1 = {
            _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] }
            , tags: ["aaa"]
        }
        let entries = [entry1];

        let actual = matcher.findMatch(entries, 2, {"m": 2, "f": 2});

        expect(actual).toEqual([]);
    });

    it("3マッチ成功", () => {
        let entry1 = {
            _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] }
            , tags: ["aaa"]
        }
        let entry2 = {
            _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] }
            , tags: []
        }
        let entry3 = {
            _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] }
        }
        let entries = [entry1, entry2, entry3];

        let actual = matcher.findMatch(entries, 3, {"m": 3, "f": 3});

        expect(actual).toEqual([entry1, entry2, entry3]);
    });

    it("4マッチひとりあまり", () => {
        let entry0 = { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } };
        let entry1 = { _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } };
        let entry2 = { _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } };
        let entry3 = { _id: { _id: "3", twitter_id: "t3", sex: "m", ng_list: [] } };
        let entry4 = { _id: { _id: "4", twitter_id: "t4", sex: "f", ng_list: [] } };
        let entries = [entry0, entry1, entry2, entry3, entry4];

        let actual = matcher.findMatch(entries, 4, {"m": 3, "f": 3});

        expect(actual).toEqual([entry0, entry1, entry2, entry4]);
    });

    it("5マッチ失敗1:4", () => {
        let entry0 = { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } };
        let entry1 = { _id: { _id: "1", twitter_id: "t1", sex: "f", ng_list: [] } };
        let entry2 = { _id: { _id: "2", twitter_id: "t2", sex: "f", ng_list: [] } };
        let entry3 = { _id: { _id: "3", twitter_id: "t3", sex: "f", ng_list: [] } };
        let entry4 = { _id: { _id: "4", twitter_id: "t4", sex: "f", ng_list: [] } };
        let entries = [entry0, entry1, entry2, entry3, entry4];

        let actual = matcher.findMatch(entries, 5, {"m": 3, "f": 3});

        expect(actual).toEqual([]);
    });

    it("3マッチ失敗 checkNg", () => {
        let entry0 = { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } };
        let entry1 = { _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } };
        let entry2 = { _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } };
        let entries = [entry0, entry1, entry2];

        let stub = sinon.stub(matcher, "checkNg").returns(true);
        stub.onSecondCall().returns(false);

        let actual = matcher.findMatch(entries, 3, {"m": 3, "f": 3});

        expect(actual).toEqual([]);

        stub.restore();
    });

    it("3マッチ失敗 ngList追加確認", () => {
        let entry0 = { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: ["t2"] } };
        let entry1 = { _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } };
        let entry2 = { _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } };
        let entries = [entry0, entry1, entry2];

        let actual = matcher.findMatch(entries, 3, {"m": 3, "f": 3});

        expect(actual).toEqual([]);
    });

    it("ng_check ok", () => {
        let entry = {_id: {twitter_id: "t0", ng_list: []}};
        let ngList = ["hoge"];
        let user = {twitter_id: "t999", ng_list: []};
        expect(matcher.checkNg([entry], ngList, user)).toBe(true);
    });

    it("ng_check ng user", () => {
        let entry = {_id: { twitter_id: "t0", ng_list: []}};
        let ngList = ["t999"];
        let user = {twitter_id: "t999", ng_list: []};
        expect(matcher.checkNg([entry], ngList, user)).toBe(false);
    });

    it("ng_check list in ng_list", () => {
        let entry = {_id: { twitter_id: "t0", ng_list: []}};
        let ngList = ["hoge"];
        let user = {twitter_id: "t999", ng_list: ["hoge", "t0"]};
        expect(matcher.checkNg([entry], ngList, user)).toBe(false);
    });

})
