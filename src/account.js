"use strict";

const rootDir = require("app-root-path");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const connectMongo = require("connect-mongo");

const secret = require(rootDir+"/secret.json");
const logger = require(rootDir+"/src/log4js");
const User = require(rootDir+"/src/model/user");
const db = require(rootDir+"/src/mongodb");

let mongoStore = connectMongo(expressSession);
let sessionStore = new mongoStore({ mongooseConnection: db.connection });


let callback;
let cookieName;
if (process.env.NODE_ENV === "prod") {
    callback = "https://random-matching.tokyo/twitter/callback";
    cookieName = "session_id";
} else {
    callback = "https://random-matching.tokyo:3452/twitter/callback";
    cookieName = "dev_session_id";
}

module.exports.session = expressSession({
    secret: secret.session.secret,
    name: cookieName,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie:{
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 180 // ミリ秒
    }
});

passport.use(new TwitterStrategy({
    consumerKey: secret.twitter.consumer_key
    ,consumerSecret: secret.twitter.consumer_secret
    ,callbackURL: callback
}, (token, tokenSecret, profile, done) => {
    passport.session.id = profile.id;
    //console.log(profile);

    // db save
    const user = new User({
        _id: profile.id
        ,twitter_token: token
        ,twitter_token_secret: tokenSecret
        ,twitter_id: profile.username
        ,twitter_name: profile.displayName
        ,twitter_created_at: profile._json.created_at
        ,image_url_https: profile.photos[0].value
    });
    User.findOneAndUpdate({ "_id" : profile.id }, user, { upsert: true }, (err, res) => {
        if (err) throw err; // TODO
    });

    // tokenとtoken_secretをセット
    profile.twitter_token = token;
    profile.twitter_token_secret = tokenSecret;

    process.nextTick(function () {
        return done(null, profile);
    });
}));

// セッションに保存
passport.serializeUser(function(user, done) {
    logger.debug("serializeUser");
    done(null, user.id);
});

// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function(id, done) {
    logger.debug("deserializeUser");
    User.findById(id, (err, user) => {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

module.exports.passport = passport;

module.exports.isAuthenticated = (req, res, next) => {
    logger.debug("isAuthenticated");
    if (req.isAuthenticated()) { // 認証済
        return next();
    } else { // 認証されていない
        res.redirect("/");  // ログイン画面に遷移
    }
}
