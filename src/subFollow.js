'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (userId, isSeeFirst) => {

    const action = isSeeFirst ? 'see_first' : 'follow';
    const form = {
        id: userId,
        action,
        location: 1,

    };
    return defFunc
        .post('https://www.facebook.com/feed/profile/sub_follow/', ctx.jar, form)
        .then(browser.saveCookies(ctx.jar))
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info(action, userId);
        })
        .catch(error => {
            log.error('subFollow', error);
        });
};
