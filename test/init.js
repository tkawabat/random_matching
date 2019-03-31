"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");

const app = require(rootDir+"/app");
const db = require(rootDir+"/src/mongodb");


before(async () => {
    await db.connection.once("open", () => {});
});

after(() => {
    db.disconnect();
    for (let s of app.schedule) {
        s.cancel();
    }
});
