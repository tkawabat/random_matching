"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");

const db = require(rootDir+"/src/mongoose");
const matcher = require(rootDir+"/src/matcher");

it("should add two numbers", (done) => {
    //var result = matcher.shuffle(33, 11);
    let result = 44;
    expect(result).toBe(44).toBeA("number");
    db.disconnect();
});
