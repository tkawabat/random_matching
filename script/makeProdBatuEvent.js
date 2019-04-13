"use strict";

process.env.NODE_ENV = "prod";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const db = require("../src/mongodb");
const Scenario = require("../src/model/scenario");
const Event = require("../src/model/event");

db.connection.once("open", async () => {
    let scenario = {
        title: "バツが欲しくて"
        ,author: "揚巻"
        ,url: "http://agemakitxt.webcrow.jp/txt/text25.html"
        ,agree_url: "http://agemakitxt.webcrow.jp/txt/text00.html"
        ,chara: [
            { name: "ユリ", sex: "f" }
            ,{ name: "春樹", sex: "m" }
        ]
        ,minutes: 20
    };

    scenario = await Scenario.schema.findOneAndUpdate({url: scenario.url}, scenario, {"upsert": true, new: true}).exec();

    let cauton = [
        "マッチングは24時間行われます。"
        ,"1:1でマッチングします。"
    ];

    let event = {
        _id: "20190413_batu"
        ,title: "『バツが欲しくて』公開記念マッチング"
        ,caution: cauton
        ,scenario: scenario._id
        ,start_at: moment("2019-04-14 12:00:00").toDate()
        ,end_at: moment("2019-04-16 23:59:59").toDate()
        ,match_count: 0
    }
    console.log(event);

    await Event.schema.findOneAndUpdate({title: event.title}, event, {"upsert": true, new: true}).exec();

    db.disconnect();
});
