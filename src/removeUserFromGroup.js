'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (userId, threadId) => {
    const form = {
        uid: userId,
        tid: threadId
    };

    return defFunc
        .post('https://www.facebook.com/chat/remove_participants/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Removed', userId, 'from', threadId);
        })
        .catch(error => {
            log.error('removeUserFromGroup', error.message);
        });
};
