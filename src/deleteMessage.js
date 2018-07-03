'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => messageIds => {
    if (!Array.isArray(messageIds)) {
        messageIds = [messageIds];
    }
    const form = {
        message_ids: messageIds,
    };

    return defFunc
        .post('https://www.facebook.com/ajax/mercury/delete_messages.php', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('deleteMessage', messageIds.toString());
        })
        .catch(error => {
            log.error('deleteMessage', error.message);
        });
};
