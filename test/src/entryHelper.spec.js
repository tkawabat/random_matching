"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const twitter = require(rootDir+"/src/twitter");
const entryHelper = require(rootDir+"/src/entryHelper");
const Entry = require(rootDir+"/src/model/entry");


let stubs = [];

describe("entryHelper tweetAct2", () => {

    beforeEach(() => {
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });

    it("tweetしない", () => {
        stubs.push(sinon.stub(Entry.model, "isEntryExist").returns(false));

        let mock = sinon.mock(twitter);
        mock.expects("tweet").never();

        entryHelper.tweetAct2();

        mock.verify();
        mock.restore();
    });

    it("tweetする", async () => {
        stubs.push(sinon.stub(Entry.model, "isEntryExist").returns(true));

        let mock = sinon.mock(twitter);
        mock.expects("tweet").once();

        await entryHelper.tweetAct2();

        mock.verify();
        mock.restore();
    });
});
