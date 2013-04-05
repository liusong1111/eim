#!/usr/local/bin/node
var io = require('socket.io').listen(5555);
var core = require("./core.js");

function fix(fn) {
    function handleError(error, result) {
        if (error) {
            console.error("error:" + error);
        } else {
            fn(error, result);
        }
    }

    return handleError;
}

function defaultRoom() {
    return io.sockets.manager.rooms["default"];
}

function myRooms(socket) {
    return io.sockets.manager.roomClients[socket.id];
}

function clientsInRoom(roomName) {
    return io.sockets.clients(roomName);
}

function startListen() {
    io.sockets.on('connection', function (socket) {
        var client = new core.Client();

        socket.on("auth", function (username, password) {
            socket.username = username;
            socket.password = password;

            socket.join('default');
        });

        socket.on("disconnect", function () {
            socket.leave("default");
        });

        socket.on("chat:message", function (message) {
            io.sockets.in("default").emit("chat:message", message);
        });
    });
}

startListen();

