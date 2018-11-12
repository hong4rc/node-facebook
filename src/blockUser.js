'use strict';

const log = require('kiat-log');

let userId;
let isBlock;
module.exports = {
    url: 'https://www.facebook.com/privacy/unblock_user/',
    init: (_userId, _isBlock = true) => {
        userId = _userId;
        isBlock = _isBlock;
        if (isBlock) {
            module.exports.url = ' https://www.facebook.com/ajax/privacy/block_user.php';
        }
    },
    getForm: () => {
        const form = {
            uid: userId
        };
        if (isBlock) {
            form.confirmed = 1;
            form.nctr = {_mod: 'pagelet_timeline_profile_actions'};
        } else {
            form.privacy_source= 'privacy_settings_page';
        }
        return form;
    },
    onSuccess: () => {
        log.info('blockUser', isBlock ? 'Blocked' : 'Unblocked', userId);
    },
    onFailure: error => {
        log.error('blockUser', error.message);
    }
};
