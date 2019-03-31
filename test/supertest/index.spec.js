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


it("index未ログイン", function(done) {
    request(app).get("/").end((err, res) => {
        expect(res.status).toBe(200);
        done();
    });
});

it("indexログイン済", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    request(app).get("/").end((err, res) => {
        expect(res.status).toBe(302);
        expect(res.text.includes("Redirecting to /entry/")).toBe(true);

        done();
    })
});
