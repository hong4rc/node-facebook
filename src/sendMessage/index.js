'use strict';

const browser = require('../../utils/browser');
const log = require('kiat-log');
const handle = require('./handle');

module.exports = (msg, threadId) => {
    if (typeof msg === 'string') {
        msg = {body: msg};
    }
    const messageAndOTId = browser.generateOfflineThreadingId();
    const form = {
        client: 'mercury',
        action_type: 'ma-type:user-generated-message',
        timestamp: Date.now(),
        source: 'source:chat:web',
        body: msg.body ? msg.body.toString() : '',
        ui_push_phase: 'C3',
        offline_threading_id: messageAndOTId,
        message_id: messageAndOTId,
        has_attachment: Boolean(msg.attachment || msg.url || msg.sticker),
    };

    if (msg.sticker) {
        form.sticker_id = msg.sticker;
    }
    return Promise.resolve()
        .then(() => handle.attachments(msg, form))
        .then(() => handle.url(msg, form))
        .then(() => handle.mention(msg, form))
        .then(() => handle.send(form, threadId))
        .then(msgId => {
            log.info('Send to', threadId, msg);
            return msgId;
        })
        .catch(error => {
            log.error('sendMessage', error.message);
        });
};
