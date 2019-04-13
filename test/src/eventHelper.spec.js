"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const Scenario = require(rootDir + "/src/model/scenario");
const Event = require(rootDir + "/src/model/event");
const eventHelper = require(rootDir+"/src/eventHelper");


let stubs = [];

describe("event helper", () => {

    beforeEach(() => {
    });

    afterEach(() => {
        for (let s of stubs) s.restore();
    });

    it("update get", async () => {
        await Scenario.schema.deleteMany().exec();
        await Event.schema.deleteMany().exec();
        let scenario = {
            author: "さくしゃ"
        };
        scenario = await Scenario.schema.findOneAndUpdate({author: scenario.author}, scenario, {"upsert": true, new: true}).exec();

        let event1 = {
            name: "公開前"
            ,scenario: scenario._id
            ,start_at: moment().add(1, "minutes").toDate()
            ,end_at: moment().add(1, "minutes").toDate()
        };
        let event2 = {
            name: "公開中"
            ,scenario: scenario._id
            ,start_at: moment().toDate()
            ,end_at: moment().add(1, "minutes").toDate()
        };
        let event3 = {
            name: "公開後"
            ,scenario: scenario._id
            ,start_at: moment().add(-1, "minutes").toDate()
            ,end_at: moment().add(-1, "seconds").toDate()
        };
        await Event.schema.insertMany([event1, event2, event3]);

        await eventHelper.update();
        let actual = eventHelper.get();

        expect(actual.length).toEqual(1);
        expect(actual[0].name).toEqual("公開中");
        expect(actual[0].scenario.author).toEqual("さくしゃ");
    });

});
