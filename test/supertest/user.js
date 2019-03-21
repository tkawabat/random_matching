"use strict";

const request = require("supertest");
const rootDir = require("app-root-path");

const app = require(rootDir+"/app");
const db = require(rootDir+"/src/mongodb");


after(() => {
    db.disconnect();
    app.schedule.cancel();
});

it("未ログイン", function(done) {
    request(app)
        .get("/user/")
        .expect(302)
        .end((err, res) => {
            done();
        });
});

it("未ログイン", function(done) {
    request(app)
        .get("/user/")
        .expect(302)
        .end((err, res) => {
            done();
        });
});
