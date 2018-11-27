'use strict';

const log = require('kiat-log');
let groupId;

// TODO: add answer

module.exports = {
    url: 'https://www.facebook.com/groups/membership/r2j/',
    init: _groupId => {
        groupId = _groupId;
    },
    getForm: () => ({
        group_id: groupId,
        client_custom_questions: '1'
    }),
    onSuccess: () => {
        log.info('requestToJoinGroup', groupId);
    },
    onFailure: error => {
        log.error('requestToJoinGroup', error);
    }
};
