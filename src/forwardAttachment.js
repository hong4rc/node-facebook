'use strict';

const browser = require('../utils/browser');
const log = require('../utils/log');

let attachmentId;
let threadIds;

module.exports = {
    url: 'https://www.messenger.com/mercury/attachments/forward/',
    init: (_attachmentId, _threadIds) => {

        if (!Array.isArray(_threadIds)) {
            _threadIds = [_threadIds];
        }
        attachmentId = _attachmentId;
        threadIds = _threadIds;
    },
    getForm: () => {
        const form = {
            attachment_id: attachmentId,
            recipient_map: {},
        };
        for (const threadId of threadIds) {
            const messageAndOTId = browser.generateOfflineThreadingId();
            form.recipient_map[messageAndOTId] = threadId;
        }
        return form;
    },
    onSuccess: () => {
        log.info('Forward attachment', attachmentId, 'to', threadIds.toString());
    },
    onFailure: error => {
        log.error('forwardAttachment', error.message);
    }
};
