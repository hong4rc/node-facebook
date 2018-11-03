'use strict';

const log = require('kiat-log');

let userId;
let action;

module.exports = {
    init: (_userId, _isFollow = true) => {
        userId = _userId;
        action = _isFollow ? 'follow' : 'unfollow';
        module.exports.url = `https://www.facebook.com/ajax/follow/${action}_profile.php`;
    },
    getForm: () => ({
        profile_id: userId,
        location: 1,
    }),
    onSuccess: () => {
        log.info(`${action} profile `, userId);
    },
    onFailure: error => {
        log.error('followProfile', error);
    }
};
