'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => threadId => {

    const form = {
        shouldSendReadReceipt: true,
        ids: {},
    };
    form.ids[threadId] = true;

    return defFunc
        .post('https://www.facebook.com/ajax/mercury/change_read_status.php', ctx.jar, form)
        .then(browser.saveCookies(ctx.jar))
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Mark as read', threadId);
        })
        .catch(error => {
            log.error('markAsRead', error);
        });
};
