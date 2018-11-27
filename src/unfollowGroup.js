'use strict';

const log = require('kiat-log');
let groupId;
let isUnfollow;

module.exports = {
    url: 'https://www.facebook.com/groups/membership/unfollow_group/',
    init: (_groupId, _isUnfollow = true) => {
        groupId = _groupId;
        isUnfollow = _isUnfollow;
    },
    getForm: () => ({
        group_id: groupId,
        unfollow: isUnfollow ? '1' : '0'
    }),
    onSuccess: () => {
        log.info(isUnfollow ? 'un' : '' + 'followGroup', groupId, isUnfollow);
    },
    onFailure: error => {
        log.error('unfollowGroup', error);
    }
};
