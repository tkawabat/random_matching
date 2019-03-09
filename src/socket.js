"use strict";

const socketio = require("socket.io");
const rootDir = require("app-root-path");

const account = require(rootDir + "/src/account");


const set = function(server) {
    let io = socketio.listen(server)
        .use(account.socketSession)
    ;


    io.on("connection", (socket) => {
        // validation
        socket.use((packet, next) => {
            let user = socket.request.user;
            let msg = packet[1];
            if (msg.sex != "f") {
                sendError("性別が正しくありません");
                return;
            }
            if (msg.skype_id.length < 3) {
                sendError("skype idが正しくありません");
                return;
            }

            return next();


            //next(new Error('validation error'));
        });

        const sendError = function(msg) {
            let user = socket.request.user;
            console.log("error send:"+user.name);
            socket.emit("error", {error: msg});
        };
        const userSave = function(msg) {
            let user = socket.request.user;
            console.log("user save:"+user.name);

            sendError("なんかえらー");
        };

        socket.on("user save", userSave);
    });

}


module.exports = set;
