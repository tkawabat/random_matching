"use strict";

process.env.NODE_ENV = "prod";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const db = require("../src/mongodb");
const User = require("../src/model/user");
const Scenario = require("../src/model/scenario");
const Reserve = require("../src/model/reserve");

db.connection.once("open", async () => {
    let scenario;

    scenario = {
        title: "フランダースの負け犬"
        ,author: "中屋敷法仁"
        ,url: "http://kaki-kuu-kyaku.com/pdf/pdf_makeinu.pdf"
        ,agree_url: "http://kaki-kuu-kyaku.com/contact.html"
        ,chara: [
            { name: "ヒュンケル", sex: "m" }
            ,{ name: "バラック", sex: "f" }
            ,{ name: "ベルニウス", sex: "o" }
            ,{ name: "クレーゼル", sex: "o" }
            ,{ name: "クルック", sex: "o" }
            ,{ name: "ベーム", sex: "o" }
            ,{ name: "ビューロウ", sex: "o" }
            ,{ name: "ヘンチュ", sex: "m" }
        ]
        ,minutes: 90
    };
    scenario = await Scenario.schema.findOneAndUpdate({url: scenario.url}, scenario, {"upsert": true, new: true}).lean().exec();


    scenario = {
        title: "パラノーマンズ・ブギー② 『幸運少女』通し版"
        ,author: "ススキドミノ"
        ,url: "http://doodletxt.web.fc2.com/paranormansboogie2.html"
        ,agree_url: "http://doodletxt.web.fc2.com/"
        ,chara: [
            { name: "速水", sex: "m" }
            ,{ name: "田中", sex: "m" }
            ,{ name: "棗", sex: "f" }
            ,{ name: "荒人", sex: "m" }
            ,{ name: "麗奈", sex: "f" }
            ,{ name: "栄", sex: "f" }
            ,{ name: "岩政", sex: "m" }
            ,{ name: "七原", sex: "m" }
            ,{ name: "ナレーション", sex: "o" }
        ]
        ,minutes: 100
    };

    scenario = await Scenario.schema.findOneAndUpdate({url: scenario.url}, scenario, {"upsert": true, new: true}).lean().exec();

    db.disconnect();
} );
