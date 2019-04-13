"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const twitter = require(rootDir+"/src/twitter");
const entryHelper = require(rootDir+"/src/entryHelper");
const Entry = require(rootDir+"/src/model/entry");


let stubs = [];

describe("entryHelper tweet", () => {

    beforeEach(() => {
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });

    it("noexist tweetしない", () => {
        stubs.push(sinon.stub(Entry.model, "isEntryExist").returns(true));

        let mock = sinon.mock(twitter);
        mock.expects("tweet").never();

        entryHelper.tweet("act3_7", null);

        mock.verify();
        mock.restore();
    });

    it("noexist tweetしない", () => {
        stubs.push(sinon.stub(Entry.model, "isEntryExist").returns(false));

        let mock = sinon.mock(twitter);
        mock.expects("tweet").never();

        entryHelper.tweet("act2", null);

        mock.verify();
        mock.restore();
    });

    it("act2 tweetする", async () => {
        stubs.push(sinon.stub(Entry.model, "isEntryExist").returns(true));

        let mock = sinon.mock(twitter);
        mock.expects("tweet").once();

        await entryHelper.tweet("act2", null);

        mock.verify();
        mock.restore();
    });

    it("event tweetする", async () => {
        stubs.push(sinon.stub(Entry.model, "isEntryExist").returns(true));

        let mock = sinon.mock(twitter);
        mock.expects("tweet").once();

        let event = {"title": "hoge"};
        await entryHelper.tweet("act2", event);

        mock.verify();
        mock.restore();
    });
});
