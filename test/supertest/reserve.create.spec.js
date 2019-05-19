"use strict";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const request = require("supertest");
const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");
const passportStub = require("passport-stub");

const app = require(rootDir+"/app");
const db = require(rootDir+"/src/mongodb");
const account = require(rootDir+"/src/account");
const Reserve = require(rootDir+"/src/model/reserve");
const reserveHelper = require(rootDir+"/src/reserveHelper");


let param = {
    start_at: moment().add(5, "minutes").format("YYYY-MM-DDTHH:mm")
    ,scenario_title: "aaa"
    ,place: "skype"
    ,public: "on"
    ,minutes: "90"
    ,chara_list: ["aaa"]
    ,sex_list: ["m"]
}

describe("supertest reserve create", () => {
    afterEach(() => {
        passportStub.uninstall(app);
    });

    it("get 未ログイン", function(done) {
        request(app).get("/reserve/create").end((err, res) => {
            expect(res.status).toBe(302);
            expect(res.header["location"]).toBe("/");
            done();
        });
    });

    it("get ログイン済", function(done) {
        passportStub.install(app);
        passportStub.login("100");

        request(app).get("/reserve/create").end((err, res) => {
            expect(res.status).toBe(200);

            done();
        })
    });

    it("post 未ログイン", function(done) {
        request(app).post("/reserve/create").send(param).end((err, res) => {
            expect(res.status).toBe(302);
            expect(res.header["location"]).toBe("/");
            done();
        });
    });

    it("post 成功", function(done) {
        passportStub.install(app);
        passportStub.login("100");

        let stub = sinon.stub(Reserve.model, "update");
        stub.returns(Promise.resolve({
            _id: 999
        }));

        request(app).post("/reserve/create").send(param).end((err, res) => {
            expect(res.status).toBe(302);
            expect(res.header["location"]).toBe("/reserve/detail/999");

            stub.restore();
            done();
        })
    });

    it("post エラー", function(done) {
        passportStub.install(app);
        passportStub.login("100");

        let tmp = JSON.parse(JSON.stringify(param));
        tmp.place = "hoge";
        tmp.minutes = "hoge";
 
        request(app).post("/reserve/create").send(tmp).end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.text.includes("場所が不適切です。")).toBe(true);
            expect(res.text.includes("時間(分)が不適切です。")).toBe(true);

            done();
        })
    });
});
