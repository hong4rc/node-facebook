'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => userId => {

    const form = {
        uid: userId,
        nctr: {_mod: 'pagelet_timeline_profile_actions'},
    };

    return defFunc
        .post('https://www.facebook.com/ajax/profile/removefriendconfirm.php', ctx.jar, form)
        .then(browser.saveCookies(ctx.jar))
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Removed friend', userId);
        })
        .catch(error => {
            log.error('removeFriend', error);
        });
};
