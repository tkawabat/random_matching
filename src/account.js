'use strict';

let rootDir = require('app-root-path');
let logger = require("morgan");
let session = require('express-session');
let passport = require('passport');
let TwitterStrategy = require('passport-twitter').Strategy;

let secret = require(rootDir + '/secret.json');
let User = require(rootDir + "/src/model/user");
let db = require(rootDir + "/src/mongodb");


// passport-twitterの設定
passport.use(new TwitterStrategy({
    consumerKey: secret.twitter.app_key,
    consumerSecret: secret.twitter.secret_key,
    callbackURL: "https://random-matching.tokyo:3000/twitter/callback"
},
    // 認証後の処理
    function(token, tokenSecret, profile, done) {
        passport.session.id = profile.id;
        //console.log(profile);

        // db save
        const user = new User({
            _id: profile.id
            ,name: profile._json.screen_name
            ,twitter_created_at: profile._json.created_at
            ,image_url_https: profile._json.profile_image_url_https
        });
        console.log("auth user "+profile.id+", "+profile.username);
        User.findOneAndUpdate({ "_id" : profile.id }, user, { upsert: true }, function(err, res) {
            console.log(err);
            //console.log(res);
        });

        // tokenとtoken_secretをセット
        profile.twitter_token = token;
        profile.twitter_token_secret = tokenSecret;

        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// セッションに保存
passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user.id);
});

// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function(id, done) {
    console.log("deserialize id: "+id);
    User.findById(id, (error, user) => {
        console.log(user);
        if (error) {
            return done(error);
        }
        done(null, user);
    });
});

function isAuthenticated(req, res, next){
    if (req.isAuthenticated()) { // 認証済
        return next();
    }
    else { // 認証されていない
        res.redirect('/');  // ログイン画面に遷移
    }
}


module.exports = {
    session: session,
    passport: passport,
    isAuthenticated: isAuthenticated
}
