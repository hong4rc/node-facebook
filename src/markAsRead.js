'use strict';

const log = require('../utils/log');

let threadId;

module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/change_read_status.php',
    init: _threadId => {
        threadId = _threadId;
    },
    getForm: () => {
        const form = {
            shouldSendReadReceipt: true,
            ids: {},
        };
        form.ids[threadId] = true;
    },
    onSuccess: () => {
        log.info('Mark as read', threadId);
    },
    onFailure: error => {
        log.error('markAsRead', error);
    }
};
