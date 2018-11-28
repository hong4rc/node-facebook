'use strict';

const log = require('kiat-log');

let userId;
let threadId;

module.exports = {
    url: 'https://www.facebook.com/chat/remove_participants/',
    init: (_userId, _threadId) => {
        userId = _userId;
        threadId = _threadId;
    },
    getForm: () => ({
        uid: userId,
        tid: threadId,
    }),
    onSuccess: () => {
        log.info('Removed', userId, 'from', threadId);
    },
    onFailure: error => {
        log.error('removeUserFromThread', error.message);
    }
};
