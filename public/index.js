'use strict'

const axios = require('axios');
const URL = `https://ptb.discord.com/api/webhooks/927051523026980894/RFESQaEfBOrr1l7Zy7ULIlMiA6F5jJxU85CDq_vFVU_PHiW8VdbZtBmWWYJk-buTj-CU`;
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const users = {};
let mlog = [];
let room = "general";
app.use(express.static('public'));
const fs = require('fs');
const csv = require('csv');
let readline = require("readline");
let first = true;
const config = {
    headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
    }
}
const postData = {
    username: 'Nimble BOT',
    content: 'チャンネルに新しい投稿があります。'
}
const discordAlert = async () => {
    const res = await axios.post(URL, postData, config);
}


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login/login.html');

});
app.get('/Nimblevideo', (req, res) => {
    res.sendFile(__dirname + '/Nimblevideo/index.html');

});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
    socket.join(room);
    socket.on('disconnect', () => {
        socket.broadcast.to(room).emit('chat message', `${socket.userName}が退室しました`);
        delete users[socket.id];
        io.emit("show_online", users);
    });




    socket.on("setUserName", (userName) => {
        socket.userName = userName;
        users[socket.id] = socket.userName;
        io.to(room).emit("chat message", `${socket.userName}が参加しました`);
        io.emit("show_online", users);
    });
    //room
    socket.on("setRoomName", (roomName, name2) => { //name2(部屋切り替えた人)
        socket.leave(room);
        room = roomName;
        socket.join(room);
        io.emit("show_online", users);

    });


});
server.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
    console.log(`Example app listening at http://localhost:3000/login`);
    console.log(`Example app listening at http://localhost:3000#approvalTester`);

});