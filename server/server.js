#!/usr/local/bin/node
var sugar = require("sugar");
var io = require('socket.io').listen(8384);

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

        socket.on("auth", function (username, password, callback) {
            socket.username = username;
            socket.password = password;

            socket.join('default');
            io.sockets.in("default").emit("chat:join", {
                username: username
            });
            var clients = clientsInRoom("default");
            var members = clients.map(function(client) {
                return {
                    username: client.username,
                    nickname: client.username,
                    signature: '还没签名'
                };
            });
            socket.emit("chat:friends", members);
            callback(null, {});
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

