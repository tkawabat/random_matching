"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const db = require(rootDir+"/src/mongodb");
const User = require(rootDir+"/src/model/user");
const cache = require(rootDir + "/src/cache");


let id = "999999";


describe("user model set", () => {
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
            expect(user.push.match).toBe(true);

            stub.restore();
            done();
        })
    });

    it("user save push match push.matchが空のとき上書きしない", (done) => {
        let stub = sinon.stub(cache, "del");
        let user = {
            _id: id
            ,push: {match: false}
        }

        User.model.set(user, (err, user) => {
            user = {
                _id: id
            }
            User.model.set(user, (err, user) => {
                expect(user.push.match).toBe(false);

                stub.restore();
                done();
            });
        });
    });
});
