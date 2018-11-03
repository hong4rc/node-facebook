'use strict';

const log = require('kiat-log');

let title;
let threadId;

module.exports = {
    url: 'https://www.facebook.com/messaging/set_thread_name/',
    init: (_title, _threadId) => {
        title = _title;
        threadId = _threadId;
    },
    getForm: () => ({
        thread_name: title,
        thread_id: threadId,
    }),
    onSuccess: () => {
        log.info('Set title of', threadId, 'is', title);
    },
    onFailure: error => {
        log.error('setTitle', error.message);
    }
};
