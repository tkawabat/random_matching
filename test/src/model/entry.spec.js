"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const Entry = require(rootDir+"/src/model/entry");


let stubs = [];

describe("entry", () => {
    beforeEach(() => {
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });


    it("isEntryExist true", async () => {
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: "act2"}
        ]);

        let actual = await Entry.model.isEntryExist("act2");
        expect(actual).toEqual(true);
    });

    it("isEntryExist 空 false", async () => {
        await Entry.schema.deleteMany().exec();

        let actual = await Entry.model.isEntryExist("act2");
        expect(actual).toEqual(false);
    });

    it("isEntryExist 空 type違い", async () => {
        await Entry.schema.deleteMany().exec();
        await Entry.schema.insertMany([
            {_id: 100, type: "act3_7"}
        ]);

        let actual = await Entry.model.isEntryExist("act2");
        expect(actual).toEqual(false);
    });
});
