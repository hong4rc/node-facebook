'use strict';

const log = require('../utils/log');

let emoji;
let threadId;

module.exports = {
    url: 'https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings',
    init: (_emoji, _threadId) => {
        emoji = _emoji;
        threadId = _threadId;
    },
    getForm: () => ({
        emoji_choice: emoji,
        thread_or_other_fbid: threadId,
    }),
    onSuccess: () => {
        log.info('change emoji', emoji, `(${threadId})`);
    },
    onFailure: error => {
        log.error('changeThreadEmoji', error.message);
    }
};
