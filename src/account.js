"use strict";

const rootDir = require("app-root-path");
const logger = require("morgan");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const passportSocketIo = require("passport.socketio");
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const connectMongo = require("connect-mongo");

const secret = require(rootDir + "/secret.json");
const User = require(rootDir + "/src/model/user");
const db = require(rootDir + "/src/mongodb");

const COOKIE_SESSION_KEY = "session_id";
const SECRET = "phee5aiWahpeekaej3lad2xaigh8sid7";


let mongoStore = connectMongo(expressSession);
let sessionStore = new mongoStore({ mongooseConnection: db.connection });

let session = expressSession({
    secret: SECRET,
    name: COOKIE_SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie:{
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 180 // ミリ秒
    }
});

let socketSession = passportSocketIo.authorize({
    passport : passport
    ,cookieParser: cookieParser
    ,key: COOKIE_SESSION_KEY
    ,secret: SECRET
    ,store: sessionStore
    ,success: function(data, accept) {
        console.log(data.user.name+"@"+data.user.id+" connected socket.");
        accept(null, true);
    }
    ,fail: function(data, message, error, accept){
        if(error) {
            throw new Error(message);
        }
        console.log("failed connection to socket.io:", message);
        accept(null, false);
    }
});

passport.use(new TwitterStrategy({
    consumerKey: secret.twitter.consumer_key
    ,consumerSecret: secret.twitter.consumer_secret
    ,callbackURL: "https://random-matching.tokyo:3000/twitter/callback"
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
    done(null, user.id);
});

// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

function isAuthenticated(req, res, next){
    if (req.isAuthenticated()) { // 認証済
        return next();
    }
    else { // 認証されていない
        res.redirect("/");  // ログイン画面に遷移
    }
}


module.exports = {
    session: session,
    socketSession: socketSession,
    passport: passport,
    isAuthenticated: isAuthenticated
}
