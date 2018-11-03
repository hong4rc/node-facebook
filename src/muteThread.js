'use strict';

const log = require('kiat-log');

let threadId;
let muteSeconds;

module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/change_mute_thread.php',
    init: (_threadId, _muteSeconds) => {
        threadId = _threadId;
        muteSeconds = _muteSeconds;
    },
    getForm: () => ({
        thread_fbid: threadId,
        mute_settings: muteSeconds,
    }),
    onSuccess: () => {
        log.info('Muted ', threadId);
    },
    onFailure: error => {
        log.error('muteThread', error.message);
    }
};
