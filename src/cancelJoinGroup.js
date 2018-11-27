'use strict';

const log = require('kiat-log');
let groupId;

// TODO: add answer

module.exports = {
    url: 'https://www.facebook.com/ajax/groups/confirm_cancel_join_dialog/',
    init: _groupId => {
        groupId = _groupId;
    },
    getForm: () => ({
        group_id: groupId
    }),
    onSuccess: () => {
        log.info('cancelJoinGroup', groupId);
    },
    onFailure: error => {
        log.error('cancelJoinGroup', error);
    }
};
