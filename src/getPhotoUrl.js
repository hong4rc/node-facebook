'use strict';

const log = require('kiat-log');

const dataPosition = 3;
const urlPosition = 0;
let photoId;

module.exports = {
    url: 'https://www.facebook.com/mercury/attachments/photo',
    init: _photoId => {
        photoId = _photoId;
    },
    getForm: () => ({
        photo_id: photoId,
    }),
    onSuccess: res => res.jsmods.require.shift()[dataPosition][urlPosition],
    onFailure: error => {
        log.error('getPhotoUrl', error.message);
    }
};
