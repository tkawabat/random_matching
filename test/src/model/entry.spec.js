"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const Entry = require(rootDir+"/src/model/entry");


let stubs = [];

describe("entry isEntryExist", () => {
    beforeEach(async () => {
        await Entry.schema.deleteMany().exec();
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });

    it("true", async () => {
        await Entry.schema.insertMany([
            {_id: 100, type: "act2"}
        ]);

        let actual = await Entry.model.isEntryExist("act2");
        expect(actual).toEqual(true);
    });

    it("false blank", async () => {
        let actual = await Entry.model.isEntryExist("act2");
        expect(actual).toEqual(false);
    });

    it("false type invalid", async () => {
        await Entry.schema.insertMany([
            {_id: 100, type: "act3_7"}
        ]);

        let actual = await Entry.model.isEntryExist("act2");
        expect(actual).toEqual(false);
    });
});

describe("entry countByType", () => {
    beforeEach(async () => {
        await Entry.schema.deleteMany().exec();
    });
 
    it("0 type", async () => {
        let actual = await Entry.model.countByType();
        expect(actual).toEqual({});
    });

    it("1 type", async () => {
        await Entry.schema.insertMany([
            {_id: 100, type: "act2"}
        ]);

        let actual = await Entry.model.countByType();
        expect(actual).toEqual({"act2": 1});
    });

    it("2 type", async () => {
        await Entry.schema.insertMany([
            {_id: 100, type: ["act2"]}
            , {_id: 102, type: ["act2", "act3_7"]}
        ]);

        let actual = await Entry.model.countByType();
        expect(actual).toEqual({"act2": 2, "act3_7": 1});
    });
});
