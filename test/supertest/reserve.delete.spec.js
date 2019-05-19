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


describe("supertest reserve delete", () => {
    afterEach(() => {
        passportStub.uninstall(app);
    });

    it("ng 未ログイン", function(done) {
        request(app).post("/reserve/delete/999").end((err, res) => {
            expect(res.status).toBe(302);
            expect(res.header["location"]).toBe("/");
            done();
        });
    });

    it("ok", function(done) {
        passportStub.install(app);
        passportStub.login("100");

        let stub = sinon.stub(Reserve.model, "delete");
        stub.returns(Promise.resolve({
            _id: 999
        }));

        request(app).post("/reserve/delete/999").end((err, res) => {
            expect(res.status).toBe(302);
            expect(res.header["location"]).toBe("/reserve/");

            stub.restore();
            done();
        })
    });

    it("ng", function(done) {
        passportStub.install(app);
        passportStub.login("100");

        let stub = sinon.stub(Reserve.model, "delete");
        stub.returns(Promise.resolve(null));

        request(app).post("/reserve/delete/999").end((err, res) => {
            expect(res.status).toBe(302);
            expect(res.header["location"]).toBe("/reserve/?warning=reserve_delete");

            stub.restore();
            done();
        })
    });
});
