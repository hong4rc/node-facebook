'use strict';
const browser = require('../utils/browser');
const formatter = require('../utils/formatter');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => ids => {
    if (!Array.isArray(ids)) {
        ids = [ids];
    }
    const form = {};
    form.ids = ids;

    return defFunc
        .post('https://www.facebook.com/chat/user_info/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            return formatter.formatProfiles(res.payload && res.payload.profiles);
        })
        .catch(error => {
            log.error('getUserInfo', error.message);
        });
};
