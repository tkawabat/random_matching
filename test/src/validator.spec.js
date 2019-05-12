"use strict";

const rootDir = require("app-root-path");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
moment.locale("ja");
const expect = require("expect");
const sinon = require("sinon");

const expressValidator = require("express-validator")
const validator = require(rootDir+"/src/validator");


let req;

describe("reserve helper get", () => {
    beforeEach(() => {
        req = {
            body: {
                skype_id: "aaa"
                ,sex: "m"
                ,ng_list: ["aaa", "", "012345678912345"]
            }
        }
    });

    it("user ok", async () => {
        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });

    it("user ng skype_id undefined", async () => {
        delete req.body.skype_id;

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ng skype_id min", async () => {
        req.body.skype_id = "aa";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ok skype_id max", async () => {
        req.body.skype_id = "0123456789012345678901234567890123456789012345678901234567890123";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });

    it("user ng skype_id max", async () => {
        req.body.skype_id = "01234567890123456789012345678901234567890123456789012345678901234";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
    });

    it("user ng skype_id ;", async () => {
        req.body.skype_id = "aaa;";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ok sex undefined", async () => {
        delete req.body.sex;

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });

    it("user ok sex f", async () => {
        req.body.sex = "f";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });

    it("user ng sex a", async () => {
        req.body.sex = "a";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ok ng_list undefined", async () => {
        delete req.body.ng_list;

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });

    it("user ng ng_list not array", async () => {
        req.body.ng_list = "aaa";

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ng ng_list over 20", async () => {
        let i;
        req.body.ng_list = ["1aaa" ,"2aaa" ,"3aaa" ,"4aaa" ,"5aaa" ,"6aaa" ,"7aaa" ,"8aaa" ,"9aaa" ,"10aaa" ,"11aaa" ,"12aaa" ,"13aaa" ,"14aaa" ,"15aaa" ,"16aaa" ,"17aaa" ,"18aaa" ,"19aaa" ,"20aaa" ,"21aaa"];

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ng ng_list 16length", async () => {
        let i;
        req.body.ng_list = [
            "aaa"
            ,"0123456789123456"
        ];

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

    it("user ng ng_list '", async () => {
        let i;
        req.body.ng_list = [
            "aaa"
            ,"aaa'"
        ];

        for (let i = 0; i < validator.user.length; i++) {
            await validator.user[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
});

describe("validator reserve create", () => {
    beforeEach(() => {
        req = {
            body: {
                start_at: moment().add(5, "minutes").format("YYYY-MM-DDTkk:00")
                ,scenario_title: "aaa"
                ,place: "skype"
                ,minutes: "90"
                ,chara_list: ["aaa"]
                ,sex_list: ["m"]
            }
        }
    });

    it("ok", async () => {
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });
    it("ng start_at is not date", async () => {
        req.body.start_at = "hoge";
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ok url", async () => {
        req.body.url = "";
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });
    it("ng url", async () => {
        req.body.url = "a";
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("sex_list undefined", async () => {
        delete req.body.sex_list;
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("sex_list ng", async () => {
        req.body.sex_list = ["a"];
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("sex_list length", async () => {
        req.body.sex_list = ["m", "m"];
        for (let check of validator.reserve.create) {
            await check(req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
});


describe("validator reserve entry guest", () => {
    beforeEach(() => {
        req = {
            body: {
                chara: "aaa"
            }
        }
    });

    it("ok アルファベット", async () => {
        req.body.name = "aaa";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });
    it("ok 日本語", async () => {
        req.body.name = "田中　太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });
    it("ok 全角記号", async () => {
        req.body.name = "田中＄％＆＜＞”太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(false);
    });
    it("ng ,", async () => {
        req.body.name = "田中,太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng ;", async () => {
        req.body.name = "田中;太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng \\", async () => {
        req.body.name = "田中\\太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng '", async () => {
        req.body.name = "田中'太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng \"", async () => {
        req.body.name = "田中\"太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng %", async () => {
        req.body.name = "田中%20太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng &", async () => {
        req.body.name = "田中&太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng #", async () => {
        req.body.name = "田中#太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng >", async () => {
        req.body.name = "田中>太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng <", async () => {
        req.body.name = "田中<太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng \\", async () => {
        req.body.name = "田中\\太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng \\n", async () => {
        req.body.name = "田中\n太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng \r", async () => {
        req.body.name = "田中\r太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });
    it("ng \0", async () => {
        req.body.name = "田中\0太郎";
        for (let i = 0; i < validator.reserve.entryGuest.length; i++) {
            await validator.reserve.entryGuest[i](req, {}, () => {});
        }
        expect(validator.isError(req)).toBe(true);
    });

});
