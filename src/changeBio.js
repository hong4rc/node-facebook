'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

const neverExpiration = -1;

module.exports = (defFunc, api, ctx) => (bio, expirationTime = neverExpiration) => {

    const form = {
        bio,
        bio_expiration_time: expirationTime
    };
    return defFunc
        .post('https://www.facebook.com/profile/intro/bio/save/', ctx.jar, form)
        .then(browser.saveCookies(ctx.jar))
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('changeBio', bio);
        })
        .catch(error => {
            log.error('changeBio', error);
        });
};
