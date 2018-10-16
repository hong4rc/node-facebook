'use strict';

const log = require('../utils/log');

let threadId;
let typing;

module.exports = {
    url: 'https://www.facebook.com/ajax/messaging/typ.php',
    init: (_threadId, _typing = true) => {
        threadId = _threadId;
        typing = _typing;
    },
    getForm: () => ({
        typ: ~~typing,
        to: threadId,
        source: 'mercury-chat',
        thread: threadId,
    }),
    onSuccess: () => {
        log.info(typing ? 'Stop' : '', 'typing', 'to', threadId);
    },
    onFailure: error => {
        log.error('sendTyping', error.message);
    }
};
