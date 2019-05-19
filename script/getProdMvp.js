"use strict";

process.env.NODE_ENV = "prod";

const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
const db = require("../src/mongodb");
const User = require("../src/model/user");
const Reserve = require("../src/model/reserve");

db.connection.once("open", async () => {
    let id = process.argv[2];

    let reserve = await Reserve.schema.findOne(
        {_id: id}
    ).populate("chara.mvp").exec();

    for (let c of reserve.chara) {
        console.log(c.name);
        if (c.mvp.length > 0) {
            c.mvp.every(e => {
                console.log(" "+e.twitter_name);
                return true;
            });
        }
    }

    db.disconnect();
});
    
