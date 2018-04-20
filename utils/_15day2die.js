'use strict';
const request = require('request');
const timer = require('./timer');
const log = require('./log');

const URL_NEXT = process.env.URL_NEXT;
const DAY_TO_DIE = process.env.DAY_TO_DIE;
const STT_CODE_OK = 200;
const MAX_TRY = 5;
const NEXT_DATE = 1;
const ERROR_CODE_RETRY = 1;

let now;
let nextDay;
let retryCounter = 0;
let readyToDie = true;
let stopCode;

const tryToDie = () => {
    request(URL_NEXT, (error, res) => {
        if (res.statusCode === STT_CODE_OK) {
            process.exit();
        } else {
            if (retryCounter >= MAX_TRY) {
                process.exit(ERROR_CODE_RETRY);
            } else {
                retryCounter++;
                tryToDie();
            }
        }
    });
};
const checkDay = () => {
    now = timer.getCurrentTime();
    nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + NEXT_DATE);
    if (readyToDie && now.getDate().toString() === DAY_TO_DIE) {
        tryToDie();
    }
    stopCode = setTimeout(checkDay, nextDay - now);
};
const start = () => {
    if (!URL_NEXT || !DAY_TO_DIE) {
        log.error('You don\'t init URL_NEXT or DAY_TO_DIE.');
        return;
    }
    readyToDie = true;
    checkDay();
};
const stop = () => {
    readyToDie = false;
    stopCode && clearTimeout(stopCode);
    stopCode = undefined;
};
module.exports = {
    start,
    stop
};
