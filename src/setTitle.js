'use strict';
const browser = require('../utils/browser');

module.exports = (defFunc, api, ctx) => (newTitle, threadID) => {
    const form = {
        thread_name: newTitle,
        thread_id: threadID
    };
    return defFunc
        .post('https://www.facebook.com/messaging/set_thread_name/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
        });
};
