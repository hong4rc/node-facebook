'use strict';

const log = require('kiat-log');
let groupId;

module.exports = {
    url: 'https://www.facebook.com/ajax/groups/membership/leave/',
    init: _groupId => {
        groupId = _groupId;
    },
    getForm: () => ({
        group_id: groupId,
        confirmed: '1'
    }),
    onSuccess: () => {
        log.info('leaveGroup', groupId);
    },
    onFailure: error => {
        log.error('leaveGroup', error);
    }
};
