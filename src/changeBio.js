'use strict';

const log = require('../utils/log');
const neverExpiration = -1;
let bio;
let expirationTime;

module.exports = {
    url: 'https://www.facebook.com/profile/intro/bio/save/',
    init: (_bio, _expirationTime = neverExpiration) => {
        bio = _bio;
        expirationTime = _expirationTime;
    },
    getForm: () => ({
        bio,
        bio_expiration_time: expirationTime
    }),
    onSuccess: () => {
        log.info('changeBio', bio, expirationTime);
    },
    onFailure: error => {
        log.error('changeBio', error);
    }
};
