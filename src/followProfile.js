'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (userId, isFollow = true) => {

    const form = {
        profile_id: userId,
        location: 1,

    };
    const action = isFollow ? 'follow' : 'unfollow';
    return defFunc
        .post(`https://www.facebook.com/ajax/follow/${action}_profile.php`, ctx.jar, form)
        .then(browser.saveCookies(ctx.jar))
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info(`${action} profile `, userId);
        })
        .catch(error => {
            log.error('followProfile', error);
        });
};
