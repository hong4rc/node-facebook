'use strict';
const request = require('request');
const timer = require('./timer');
const log = require('./log');

const URL_REQUEST_MYSELF = '/myself';
const SPACE_INDENT = 4;
const STT_CODE_OK = 200;
const DEFAULT_TIME_IDLING = 60000;
const TIME_IDLING = process.env.TIME_IDLING || DEFAULT_TIME_IDLING;
const baseUrl = process.env.BASE_URL;
if (!baseUrl) {
    log.error('Please init process.env.BASE_URL.');
}
const timeRequest = [];
const requestMyself = () => {
    log.info('requestMyself', baseUrl + URL_REQUEST_MYSELF);
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

module.exports = () => {
    intervalRequest();
    return (req, res, next) => {
        if (baseUrl && req.originalUrl === URL_REQUEST_MYSELF) {
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
};
