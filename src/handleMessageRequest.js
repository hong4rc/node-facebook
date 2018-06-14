'use strict';
const browser = require('../utils/browser');

module.exports = (defFunc, api, ctx) => (threadIds, accept) => {
    if (!Array.isArray(threadIds)) {
        threadIds = [threadIds];
    }
    const form = {};
    if (accept) {
        form.inbox = threadIds;
    } else {
        form.other = threadIds;
    }

    return defFunc
        .post('https://www.facebook.com/ajax/mercury/move_thread.php', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
        });
};
