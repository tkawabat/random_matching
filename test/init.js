"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");

const app = require(rootDir+"/app");
const db = require(rootDir+"/src/mongodb");
const schedule = require(rootDir+"/src/schedule");


before(async () => {
    await db.connection.once("open", () => {});
});

after(() => {
    db.disconnect();
    schedule.cancelAll();
});
