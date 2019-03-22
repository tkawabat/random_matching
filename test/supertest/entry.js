"use strict";

const request = require("supertest");
const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");
const passportStub = require("passport-stub");

const app = require(rootDir+"/app");
const db = require(rootDir+"/src/mongodb");
const account = require(rootDir+"/src/account");


afterEach(() => {
    passportStub.uninstall(app);
});
after(() => {
    db.disconnect();
    app.schedule.cancel();
});


it("entry未ログイン", function(done) {
    request(app).get("/entry/").end((err, res) => {
        expect(res.status).toBe(302);
        done();
    });
});

it("entryログイン済", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    request(app).get("/entry/").end((err, res) => {
        expect(res.status).toBe(200);

        done();
    })
});

it("entry キャンセル成功", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    request(app).post("/entry/cancel").end((err, res) => {
        expect(res.status).toBe(302);
        expect(res.text.includes("Redirecting to /entry/")).toBe(true);

        done();
    })
});
