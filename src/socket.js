"use strict";

const socketio = require("socket.io");
const rootDir = require("app-root-path");

const account = require(rootDir + "/src/account");


const set = function(server) {
    let io = socketio.listen(server)
        .use(account.socketSession)
    ;

    io.on("connection", (socket) => {
        socket.on("save skype", function(msg) {
            console.log(msg);
        
        });
    });
}


module.exports = set;
