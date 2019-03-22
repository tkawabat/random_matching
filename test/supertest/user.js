"use strict";

const request = require("supertest");
const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");
const passportStub = require("passport-stub");

const app = require(rootDir+"/app");
const db = require(rootDir+"/src/mongodb");
const account = require(rootDir+"/src/account");


before((done) => {
    db.connection.once("open", async () => {
        done();
    });
});
after(() => {
    db.disconnect();
    app.schedule.cancel();
});


it("未ログイン", function(done) {
    request(app).get("/user/")
        .end((err, res) => {
            expect(res.status).toBe(302);
            done();
        });
});

it("ログイン済", function(done) {
    passportStub.install(app);
    passportStub.login("100");

    request(app).get("/user/")
        .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.text.includes("@id100")).toBe(true);

            passportStub.uninstall(app);
            done();
        })
});
