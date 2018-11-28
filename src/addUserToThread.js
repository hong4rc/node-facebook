'use strict';

const browser = require('../utils/browser');
const log = require('kiat-log');

let userIds;
let threadId;
module.exports = {
    url: 'https://www.facebook.com/messaging/send/',
    init: (_userIds, _threadId) => {
        userIds = _userIds;
        threadId = _threadId;
    },
    getForm: () => {
        if (!Array.isArray(userIds)) {
            userIds = [userIds];
        }
        const messageAndOTId = browser.generateOfflineThreadingId();
        const form = {
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
        return form;
    },
    onSuccess: () => {
        log.info('Added', userIds.toString(), 'to', threadId);
    },
    onFailure: error => {
        log.error('addUserToThread', error.message);
    }
};
