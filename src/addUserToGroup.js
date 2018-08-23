'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (userIds, threadId) => {
    if (!Array.isArray(userIds)) {
        userIds = [userIds];
    }
    const messageAndOTId = browser.generateOfflineThreadingId();
    const form = {
        client: 'mercury',
        action_type: 'ma-type:log-message',
        timestamp: Date.now(),
        source: 'source:chat:web',
        log_message_type: 'log:subscribe',
        offline_threading_id: messageAndOTId,
        message_id: messageAndOTId,
        thread_fbid: threadId,
    };
    const participants = [];
    for (const userId of userIds) {
        participants.push(`fbid:${userId}`);
    }
    form.log_message_data = {added_participants: participants};

    return defFunc
        .post('https://www.facebook.com/messaging/send/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Added', userIds.toString(), 'to', threadId);
        })
        .catch(error => {
            log.error('addUserToGroup', error.message);
        });
};
