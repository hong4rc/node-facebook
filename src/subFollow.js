'use strict';

const log = require('kiat-log');

let userId;
let action;

module.exports = {
    url: 'https://www.facebook.com/feed/profile/sub_follow/',
    init: (_userId, _isSeeFirst) => {
        userId = _userId;
        action = _isSeeFirst ? 'see_first' : 'follow';
    },
    getForm: () => ({
        id: userId,
        action,
        location: 1,

    }),
    onSuccess: () => {
        log.info(action, userId);
    },
    onFailure: error => {
        log.error('subFollow', error);
    }
};
