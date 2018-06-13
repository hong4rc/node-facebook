'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => threadId => {

    const form = {
        shouldSendReadReceipt: true,
    };
    form[`ids[${threadId}]`] = true;

    defFunc
        .post('https://www.facebook.com/ajax/mercury/change_read_status.php', ctx.jar, form)
        .then(browser.saveCookies(ctx.jar))
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(body => {
            if (body.error) {
                throw body.error;
            }
        })
        .catch(err => {
            log.error('markAsRead', err);
            return err;
        });
};
