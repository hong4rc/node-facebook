'use strict';

const log = require('kiat-log');

let form;

module.exports = {
    url: 'https://www.facebook.com/messaging/send/',
    init: _form => {
        form = _form;
    },
    getForm: () => form,
    onSuccess: res => res.payload.actions.shift().message_id,
    onFailure: error => {
        log.error('send', error.message);
    }
};
