"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const Entry = require(rootDir+"/src/model/entry");


let stubs = [];

describe("entryHelper dbあり", () => {
    beforeEach(() => {
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("isEntryExist true", async () => {
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100}
        ]);

        let actual = await Entry.model.isEntryExist();
        expect(actual).toEqual(true);
    });

    it("isEntryExist false", async () => {
        await Entry.schema.deleteMany().exec();

        let actual = await Entry.model.isEntryExist();
        expect(actual).toEqual(false);
    });

});
