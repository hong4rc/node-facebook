'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');
const formatter = require('../utils/formatter');

module.exports = (defFunc, api, ctx) => () => {
    const form = {};

    return defFunc
        .post(`https://www.facebook.com/chat/user_info_all/?viewer=${ctx.userId}`, ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            return formatter.formatProfiles(res.payload);
        })
        .catch(error => {
            log.error('getFriendList', error.message);
        });
};
