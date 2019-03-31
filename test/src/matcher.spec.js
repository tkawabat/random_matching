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
        stubs.push(sinon.stub(Match.schema, "findOneAndUpdate"));
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });

    it("2マッチ成功", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } }
        ];

        let actual = matcher.findMatch(entries, 2);

        expect(actual).toEqual([
            { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] }
            ,{ _id: "1", twitter_id: "t1", sex: "m", ng_list: [] }
        ]);
    });

    it("2マッチ人数不足", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } }
        ];

        let actual = matcher.findMatch(entries, 2);

        expect(actual).toEqual([]);
    });

    it("3マッチ成功", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } }
        ];

        let actual = matcher.findMatch(entries, 3);

        expect(actual).toEqual([
            { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] }
            ,{ _id: "1", twitter_id: "t1", sex: "m", ng_list: [] }
            ,{ _id: "2", twitter_id: "t2", sex: "m", ng_list: [] }
        ]);
    });

    it("4マッチひとりあまり", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "3", twitter_id: "t3", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "4", twitter_id: "t4", sex: "f", ng_list: [] } }
        ];

        let actual = matcher.findMatch(entries, 4);

        expect(actual).toEqual([
            { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] }
            ,{ _id: "1", twitter_id: "t1", sex: "m", ng_list: [] }
            ,{ _id: "2", twitter_id: "t2", sex: "m", ng_list: [] }
            ,{ _id: "4", twitter_id: "t4", sex: "f", ng_list: [] }
        ]);
    });

    it("5マッチ失敗1:4", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "1", twitter_id: "t1", sex: "f", ng_list: [] } }
            ,{ _id: { _id: "2", twitter_id: "t2", sex: "f", ng_list: [] } }
            ,{ _id: { _id: "3", twitter_id: "t3", sex: "f", ng_list: [] } }
            ,{ _id: { _id: "4", twitter_id: "t4", sex: "f", ng_list: [] } }
        ];

        let actual = matcher.findMatch(entries, 5);

        expect(actual).toEqual([]);
    });

    it("3マッチ失敗 checkNg", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } }
        ];

        let stub = sinon.stub(matcher, "checkNg").returns(true);
        stub.onSecondCall().returns(false);

        let actual = matcher.findMatch(entries, 3);

        expect(actual).toEqual([]);

        stub.restore();
    });

    it("3マッチ失敗 ngList追加確認", () => {
        let entries = [
            { _id: { _id: "0", twitter_id: "t0", sex: "m", ng_list: ["t2"] } }
            ,{ _id: { _id: "1", twitter_id: "t1", sex: "m", ng_list: [] } }
            ,{ _id: { _id: "2", twitter_id: "t2", sex: "m", ng_list: [] } }
        ];

        let actual = matcher.findMatch(entries, 3);

        expect(actual).toEqual([]);
    });

    it("ng_check ok", () => {
        let user0 = {twitter_id: "t0", ng_list: []};
        let ngList = ["hoge"];
        let user = {twitter_id: "t999", ng_list: []};
        expect(matcher.checkNg([user0], ngList, user)).toBe(true);
    });

    it("ng_check ng user", () => {
        let user0 = {twitter_id: "t0", ng_list: []};
        let ngList = ["t999"];
        let user = {twitter_id: "t999", ng_list: []};
        expect(matcher.checkNg([user0], ngList, user)).toBe(false);
    });

    it("ng_check list in ng_list", () => {
        let user0 = {twitter_id: "t0", ng_list: []};
        let ngList = ["hoge"];
        let user = {twitter_id: "t999", ng_list: ["hoge", "t0"]};
        expect(matcher.checkNg([user0], ngList, user)).toBe(false);
    });

    it("matched sendDm", () => {
        let user0 = {twitter_id: "t0", push: {match: true}};
        let user1 = {twitter_id: "t1", push: {match: false}};

        let mock = sinon.mock(twitter);
        let text = "マッチングしました。結果を確認してください。\n";
            //+"https://random-matching.tokyo";
        mock.expects("sendDm").once();

        matcher.matched([user0, user1]);

        mock.verify();

        mock.restore();
    });

})
