'use strict';

const log = require('kiat-log');

let messageIds;

module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/delete_messages.php',
    init: _messageIds => {
        messageIds = _messageIds;
    },
    getForm: () => ({
        message_ids: messageIds,
    }),
    onSuccess: () => {
        log.info('deleteMessage', messageIds.toString());
    },
    onFailure: error => {
        log.error('deleteMessage', error.message);
    }
};
