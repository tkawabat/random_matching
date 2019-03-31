const Twit = require('twit')

const rootDir = require("app-root-path");
const logger = require(rootDir + "/src/log4js");
const secret = require(rootDir + "/secret.json");


let twitter = new Twit({
    consumer_key:         secret.twitter_admin.consumer_key,
    consumer_secret:      secret.twitter_admin.consumer_secret,
    access_token:         secret.twitter_admin.access_token_key,
    access_token_secret:  secret.twitter_admin.access_token_secret,
    timeout_ms:           3*1000,
    strictSSL:            true,
})

module.exports.sendDm = (user, text) => {
    logger.info("sending dm to "+user.twitter_id);

    let param = {
        event: {
            type: "message_create"
            ,message_create: {
                target: { recipient_id: user._id }
                ,message_data : {
                    text: text
                }
            }
        }
    }

    twitter.post("direct_messages/events/new", param, (err, res) => {
        if (err) logger.error(err);
    });
}

