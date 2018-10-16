'use strict';

const qString = require('querystring');
const log = require('../utils/log');

let threadId;
let block;
module.exports = {
    init: (_threadId, _block) => {
        threadId = _threadId;
        block = _block;
        if (block) {
            let query = {
                thread_fbid: threadId,
                location: 'www_chat_head',
                action_name: 'BLOCK_MESSAGES',
            };
            query = qString.stringify(query);
            module.exports.url = `https://www.facebook.com/nfx/block_messages/confirm/?${query}`;
        } else {
            let query = {
                reportable_ent_token: threadId,
                initial_action_name: 'BLOCK_MESSAGES',
            };
            query = JSON.stringify(query);
            module.exports.url = `https://www.facebook.com/ajax/nfx/messenger_undo_block?context=${query}`;
        }
    },
    getForm: () => ({}),
    onSuccess: () => {
        log.info(block ? 'Blocked' : 'Unblock', threadId);
    },
    onFailure: error => {
        log.error('changeBlockedStatus', error.message);
    }
};
