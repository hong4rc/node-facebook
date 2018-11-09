'use strict';

const log = require('kiat-log');
const FIRST = 0;

let attachment;

module.exports = {
    method: 'postFormData',
    url: 'https://upload.facebook.com/ajax/mercury/upload.php',
    init: _attachment => {
        attachment = _attachment;
    },
    getForm: () => ({
        upload_1024: attachment,
        voice_clip: 'true',
    }),
    onSuccess: res => res.payload.metadata[FIRST],
    onFailure: error => {
        log.error('upLoadFile', error.message);
    }
};
