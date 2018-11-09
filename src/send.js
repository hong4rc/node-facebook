'use strict';

const log = require('kiat-log');

let form;
let threadId;

module.exports = {
    url: 'https://www.facebook.com/messaging/send/',
    init: (_form, _threadId) => {
        form = _form;
        threadId = _threadId;
    },
    getForm: () => form,
    onSuccess: () => {
        log.info('Send message', 'to', threadId);
    },
    onFailure: error => {
        log.error('sendMessage', error.message);
    }
};
