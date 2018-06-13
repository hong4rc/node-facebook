'use strict';
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const requestMyself = require('request-myself');
const log = require('./utils/log');
const timer = require('./utils/timer');

const DEFAULT_PORT = 1997;
const DEFAULT_TIME_IDLING = 60000;
const port = process.env.PORT || DEFAULT_PORT;
server.listen(port, () => log.info(`This app is running in Port: ${port}`));

app.use(express.static('public'));
const option = {
    hostname: process.env.BASE_URL,
    timeout: process.env.TIME_IDLING || DEFAULT_TIME_IDLING
};
app.use(requestMyself(option, (error, res) => {
    if (error) {
        log.error('RequestMyself statusCode:', res.statusCode, error);
    } else {
        log.info('RequestMyself statusCode:', res.statusCode, timer.getCurrentTime());
    }
}));

const addMsg = msg => {
    io.emit('new_msg', msg);
};

module.exports = {addMsg};
