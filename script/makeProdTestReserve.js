"use strict";

process.env.NODE_ENV = "prod";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const db = require("../src/mongodb");
const User = require("../src/model/user");
const Scenario = require("../src/model/scenario");
const Reserve = require("../src/model/reserve");


db.connection.once("open", async () => {
    // パラの２通し
    let url = "http://doodletxt.web.fc2.com/paranormansboogie2.html";
    scenario = await Scenario.schema.findOne({url: url}).lean().exec();

    let reserve = {
        owner: "1096744908948271104" // random matching
        ,scenario: scenario._id
        ,start_at: moment("2019-04-30 10:00:00").toDate()
        ,public: false
        ,place: "skype"
        ,chara: scenario.chara.slice()
    }
    reserve.chara[0].user = "1096744908948271104";
    reserve.chara[1].guest = "未登録な人";

    await Reserve.schema.findOneAndUpdate(
        {owner: reserve.owner, scenario: reserve.scenario}
        ,reserve
        ,{"upsert": true, new: true}
    ).exec();

    db.disconnect();
} );
