"use strict";

const rootDir = require("app-root-path");
const express = require("express");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

const router = express.Router();
const account = require(rootDir + "/src/account");


router.get("/", function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/user");
    } else {
        res.render("index", { title: "Express" });
    }
});

router.get("/twitter/login",
    account.passport.authenticate("twitter"), (req, res) => {
        res.json({ user: req.user });
    });

router.get("/twitter/callback",
    account.passport.authenticate("twitter", { 
        successRedirect: "/user",
        failureRedirect: "/?auth_failed"
    }));

router.get("/logout", function(req, res){
      req.logout();
      res.redirect("/");
});

router.get("/user", account.isAuthenticated, function(req, res) {
    console.log(req.user);
    res.render("user", { title: "らんだむまっちんぐ", user: req.user });
});


router.get("/react", function(req, res) {
    ReactDOMServer.renderToNodeStream(
        <Html>
        <App />
        </Html>
    ).pipe(res);
}

module.exports = router;
