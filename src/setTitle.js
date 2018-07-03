'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (newTitle, threadId) => {
    const form = {
        thread_name: newTitle,
        thread_id: threadId,
    };

    return defFunc
        .post('https://www.facebook.com/messaging/set_thread_name/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Set title of ', threadId, 'is', newTitle);
        })
        .catch(error => {
            log.error('setTitle', error.message);
        });
};
