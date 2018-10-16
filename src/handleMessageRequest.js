'use strict';

const log = require('../utils/log');

let threadIds;
let accept;

module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/move_thread.php',
    init: (_threadIds, _accept) => {
        if (!Array.isArray(_threadIds)) {
            _threadIds = [_threadIds];
        }
        threadIds = _threadIds;
        accept = _accept;
    },
    getForm: () => {
        const form = {};
        if (accept) {
            form.inbox = threadIds;
        } else {
            form.other = threadIds;
        }
        return form;
    },
    onSuccess: () => {
        log.info('Handle message request', threadIds, accept);
    },
    onFailure: error => {
        log.error('handleMessageRequest', error.message);
    }
};
