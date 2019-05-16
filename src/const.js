"use strict";

module.exports.BASE_URL = "https://random-matching.tokyo";
module.exports.IMAGE_TWITTER_DEFAULT = "https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png";

module.exports.SEX = {
    "m": "男性"
    ,"f": "女性"
    ,"o": "不問"
}
module.exports.SEX_ICON = {
    "m": "♀"
    ,"f": "♂"
    ,"o": "❓"
}
module.exports.SEX_CLASS = {
    "m": "mars"
    ,"f": "venus"
    ,"o": "question"
}
module.exports.RESERVE_PLACE = {
    "skype": "Skype"
    ,"discord": "Discord"
    ,"lispon": "Lispon"
    ,"twitcasting_skype": "ツイキャス(Skype)"
    ,"twitcasting_discord": "ツイキャス(Discord)"
    ,"other": "その他"
}
module.exports.MATCH_EXPIRE_SECONDS = 60 * 30;

module.exports.REGEX_INVALID_STRINGS = /[,;'"%&#><\\\n\r\0]/;
module.exports.INPUT_STRING_PATTERN = "^[^,;'\"%&#><\\\\\n\r]+$";
module.exports.URL_LENGTH_MAX = 256;
module.exports.TEXT_LENGTH_MAX = 64;
module.exports.OBJECT_ID_LENGTH_MAX = 24;

module.exports.RESERVE_EDIT_MINUTE = 30
module.exports.RESERVE_LIMIT_PER_WEEK = 10
