'use strict';

let rootDir = require('app-root-path');
let secret = require(rootDir + '/secret.json');
let session = require('express-session');
let passport = require('passport');
let TwitterStrategy = require('passport-twitter').Strategy;

// passport-twitterの設定
passport.use(new TwitterStrategy({
    consumerKey: secret.twitter.app_key,
    consumerSecret: secret.twitter.secret_key,
    callbackURL: "https://random-matching.tokyo:3000/twitter/callback"
},
    // 認証後の処理
    function(token, tokenSecret, profile, done) {
        passport.session.id = profile.id;

        // tokenとtoken_secretをセット
        profile.twitter_token = token;
        profile.twitter_token_secret = tokenSecret;

        process.nextTick(function () {
            return done(null, profile);
        });
        //return done(null, profile);
    }
));

// セッションに保存
passport.serializeUser(function(user, done) {
    done(null, user);
});

// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// 認証済みか判定
function isAuthenticated(req, res, next){
    if (req.isAuthenticated()) { // 認証済
        return next();
    }
    else { // 認証されていない
        res.redirect('/');  // ログイン画面に遷移
    }
}

exports.session = session;
exports.passport = passport;
exports.isAuthenticated = isAuthenticated;
