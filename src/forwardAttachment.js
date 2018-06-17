'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (attachmentId, threadIds) => {
    if (!Array.isArray(threadIds)) {
        threadIds = [threadIds];
    }
    const form = {
        attachment_id: attachmentId,
        recipient_map: {}
    };
    for (const threadId of threadIds) {
        const messageAndOTId = browser.generateOfflineThreadingId();
        form.recipient_map[messageAndOTId] = threadId;
    }

    return defFunc
        .post('https://www.messenger.com/mercury/attachments/forward/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Forward attachment', attachmentId, 'to', threadIds.toString());
        })
        .catch(error => {
            log.error('forwardAttachment', error.message);
        });
};
