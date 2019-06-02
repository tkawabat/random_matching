"use strict";

const rootDir = require("app-root-path");
const expect = require("expect");
const sinon = require("sinon");

const tags = require(rootDir+"/src/tags");


let req;

describe("parse", () => {
    it("normal", async () => {
        let raw = "[{\"value\":\"台本~60分\"},{\"value\":\"雑談多め\"}]";
        let actual = tags.parse(raw);
        
        let expected = [
            "台本~60分"
            ,"雑談多め"
        ];
        expect(actual).toEqual(expected);
    });
    it("blank", async () => {
        let raw = "";
        let actual = tags.parse(raw);
        
        let expected = [];
        expect(actual).toEqual(expected);
    });
    it("blank element", async () => {
        let raw = "[{\"value\":\"台本~60分\"},{}]";
        let actual = tags.parse(raw);
        
        let expected = ["台本~60分"];
        expect(actual).toEqual(expected);
    });
    it("blank value", async () => {
        let raw = "[{\"value\":\"台本~60分\"},{\"value\":\"\"}]";
        let actual = tags.parse(raw);
        
        let expected = ["台本~60分"];
        expect(actual).toEqual(expected);
    });
    it("undefined", async () => {
        let raw = undefined;
        let actual = tags.parse(raw);
        
        let expected = [];
        expect(actual).toEqual(expected);
    });
    it("null", async () => {
        let raw = null;
        let actual = tags.parse(raw);
        
        let expected = [];
        expect(actual).toEqual(expected);
    });
    it("invalid string", async () => {
        let raw = "[{\"value\":\"台本~60分\"},{\"value\":\"雑談多め\"}]hoge";
        let actual = tags.parse(raw);
        
        let expected = [];
        expect(actual).toEqual(expected);
    });
});
