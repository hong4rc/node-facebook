'use strict';

const log = require('kiat-log');

let nickname;
let threadId;
let participantId;

module.exports = {
    url: 'https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings',
    init: (_nickname, _threadId, _participantId) => {
        nickname = _nickname;
        threadId = _threadId;
        participantId = _participantId;
    },
    getForm: () => ({
        nickname,
        thread_or_other_fbid: threadId,
        participant_id: participantId || threadId,
    }),
    onSuccess: () => {
        log.info('changeNickname', participantId, ':', nickname, `(${threadId})`);
    },
    onFailure: error => {
        log.error('changeNickname', error.message);
    }
};
