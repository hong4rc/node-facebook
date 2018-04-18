'use strict';

// default is my timezone
let TimeZone = 7;
const HOUR = 60;

/**
 * Return real time in your location
 * @returns {Date}
 * */
const getCurrentTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + TimeZone * HOUR);
    return now;
};
const setTimeZone = timeZone => {
    TimeZone = timeZone;
};
module.exports = {
    setTimeZone,
    getCurrentTime,
};
