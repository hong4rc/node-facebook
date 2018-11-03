'use strict';

const loader = require('./loader');
const formatter = require('../utils/formatter');
const log = require('kiat-log');

module.exports = {
    init: () => {
        module.exports.url = `https://www.facebook.com/chat/user_info_all/?viewer=${loader.getCtx().userId}`;
    },
    getForm: () => ({}),
    onSuccess: res => formatter.formatProfiles(res.payload),
    onFailure: error => {
        log.error('getFriendList', error.message);
    }
};
