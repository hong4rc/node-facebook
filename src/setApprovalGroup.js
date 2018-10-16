'use strict';

const log = require('../utils/log');

let mode;
let threadId;

module.exports = {
    url: 'https://www.facebook.com/messaging/set_approval_mode/',
    init: (_mode, _threadId) => {
        mode = _mode;
        threadId = _threadId;
    },
    getForm: () => ({
        set_mode: Number(mode),
        thread_fbid: threadId,
    }),
    onSuccess: () => {
        log.info('Set Approval', mode, threadId);
    },
    onFailure: error => {
        log.error('setApprovalGroup', error.message);
    }
};
