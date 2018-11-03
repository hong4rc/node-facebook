'use strict';

const log = require('kiat-log');

let userId;

module.exports = {
    url: 'https://www.facebook.com/ajax/profile/removefriendconfirm.php',
    init: _userId => {
        userId = _userId;
    },
    getForm: () => ({
        uid: userId,
        nctr: {_mod: 'pagelet_timeline_profile_actions'},
    }),
    onSuccess: () => {
        log.info('Removed friend', userId);
    },
    onFailure: error => {
        log.error('removeFriend', error);
    }
};
