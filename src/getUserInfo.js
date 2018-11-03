'use strict';

const log = require('kiat-log');
const formatter = require('../utils/formatter');

let ids;

module.exports = {
    url: 'https://www.facebook.com/chat/user_info/',
    init: _ids => {
        if (!Array.isArray(_ids)) {
            _ids = [_ids];
        }
        ids = _ids;
    },
    getForm: () => ({
        ids
    }),
    onSuccess: res => formatter.formatProfiles(res.payload && res.payload.profiles),
    onFailure: error => {
        log.error('getUserInfo', error.message);
    }
};
