'use strict';
const request = require('request');
const timer = require('./timer');

const URL_REQUEST_MYSELF = '/myself';
const SPACE_INDENT = 4;
const STT_CODE_OK = 200;
const DEFAULT_TIME_IDLING = 60000;
const TIME_IDLING = process.env.TIME_IDLING || DEFAULT_TIME_IDLING;
let baseUrl = '';

const timeRequest = [];
const requestMyself = () => {
    request(baseUrl + URL_REQUEST_MYSELF, (error, res) => {
        if (res && res.statusCode === STT_CODE_OK) {
            timeRequest.push({time: timer.getCurrentTime()});
        } else {
            requestMyself();
        }
    });
};
const intervalRequest = () => {
    setInterval(requestMyself, TIME_IDLING);
};

module.exports = (req, res, next) => {
    if (!baseUrl) {
        baseUrl = `${req.protocol}://${req.get('host')}`;
        intervalRequest();
    }
    if (req.originalUrl === URL_REQUEST_MYSELF) {
        const data = {
            isRunning: true,
            timeRequest
        };
        res.writeHead(STT_CODE_OK, {
            'Content-Type': 'text/json; charset=utf-8'
        });
        res.end(JSON.stringify(data, null, SPACE_INDENT));
    } else {
        next();
    }
};
