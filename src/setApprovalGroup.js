'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (mode, threadId) => {
    const form = {
        set_mode: Number(mode),
        thread_fbid: threadId,
    };

    return defFunc
        .post('https://www.facebook.com/messaging/set_approval_mode/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Set Approval', mode, threadId);
        })
        .catch(error => {
            log.error('setApprovalGroup', error.message);
        });
};
