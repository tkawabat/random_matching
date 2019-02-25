'use strict';

let rootDir = require('app-root-path');
let express = require('express');
let router = express.Router();

let configRoutes = function(app, passport) {
    router.get('/login',
        passport.authenticate("twitter"), (req, res) => {
            res.json({ user: req.user });
        });

    router.get('/callback',
        passport.authenticate('twitter', { 
            successRedirect: '/user',
            failureRedirect: '/?auth_failed'
        }));
    return router;
}

module.exports = {
    configRoutes: configRoutes
};
