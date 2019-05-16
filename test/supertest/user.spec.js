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
const User = require(rootDir + "/src/model/user");


afterEach(() => {
    passportStub.uninstall(app);
});


it("user未ログイン", function(done) {
    request(app).get("/user/").end((err, res) => {
        expect(res.status).toBe(302);
        expect(res.text.includes("Redirecting to /")).toBe(true);
        done();
    });
});

it("userログイン済", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    request(app).get("/user/").end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.text.includes("@id100")).toBe(true);

        done();
    })
});

it("user save成功", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    let param = {
        skype_id: "skypeid100",
        sex: "f",
        push_match: "on",
    }
    request(app).post("/user/").send(param).end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.text.includes("skypeid100")).toBe(true);
        expect(res.text.includes("name=\"push_match\" checked")).toBe(true);

        done();
    })
});

it("user save成功 push_match off", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    let param = {
        skype_id: "skypeid100",
        sex: "f",
    }
    request(app).post("/user/").send(param).end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.text.includes("skypeid100")).toBe(true);
        expect(res.text.includes("name=\"push_match\" checked")).toBe(false);

        done();
    })
});
it("user save validateエラー", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    let param = {
        skype_id: "skypeid100",
        sex: "aaa",
    }
    request(app).post("/user/").send(param).end((err, res) => {
        expect(res.status).toBe(400);
        expect(res.text.includes("入力値に問題があります")).toBe(true);

        done();
    })
});

it("user save saveエラー", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    let stub = sinon.stub(User.model, "set");
    stub.callsArgWith(1, true, null);

    let param = {
        skype_id: "skypeid100"
        ,sex: "f"
    }
    request(app).post("/user/").send(param).end((err, res) => {
        expect(res.status).toBe(500);
        expect(res.text.includes("ユーザー情報の更新に失敗しました")).toBe(true);

        stub.restore();
        done();
    })

});
