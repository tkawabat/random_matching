"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const cache = require(rootDir + "/src/cache");


let id = "999999";


beforeEach((done) => {
    User.schema.deleteOne({_id: id}, (err, user) => {
        done();
    });
});


it("user save push match デフォルト値", (done) => {
    let stub = sinon.stub(cache, "del");
    let user = {
        _id: id
        ,sex: "f"
    }

    User.model.set(user, (err, user) => {
        expect(user.push.match).toEqual(true);

        stub.restore();
        done();
    })
});
