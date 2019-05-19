"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const Reserve = require(rootDir+"/src/model/reserve");
const cache = require(rootDir + "/src/cache");


let id = new db.Types.ObjectId;

let reserve = {
    _id: id
    ,owner: "100"
    ,start_at: moment().toDate()
    ,chara: [
        { _id: new db.Types.ObjectId, name: "taro", sex:"m"}
    ]
};

describe("reserve delete", () => {

    beforeEach((done) => {
        Reserve.schema.deleteMany({}, (err, user) => {
            done();
        });
    });

    it("ng no data", async () => {
        let ret = await Reserve.model.delete({_id: "100"}, id);
        expect(ret).toBe(null);
    });

    it("ok", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.delete({_id: "100"}, id);
        expect(ret._id).toEqual(id);
    });

    it("ng id違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.delete({_id: "100"}, new db.Types.ObjectId);
        expect(ret).toBe(null);
    });

    it("ng user違い", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.delete({_id: "200"}, new db.Types.ObjectId);
        expect(ret).toBe(null);
    });

    it("ng 時間", async () => {
        let tmp = JSON.parse(JSON.stringify(reserve));
        tmp.start_at = moment().add(-31, "minutes").toDate();
        await Reserve.schema.insertMany(tmp);

        let ret = await Reserve.model.delete({_id: "100"}, new db.Types.ObjectId);
        expect(ret).toBe(null);
    });
});

