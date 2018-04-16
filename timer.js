'use strict';

let TimeZone = 7;//default is my timezone

/**
 * Return real time in your location
 * @returns {Date}
 * */
let getCurrentTime = () => {
    let now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + TimeZone * 60);
    return now;
};
let setTimeZone = timeZone => {
    TimeZone = timeZone;
};
module.exports = {
    setTimeZone,
    getCurrentTime,
};