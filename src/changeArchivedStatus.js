'use strict';
const browser = require('../utils/browser');

module.exports = (defFunc, api, ctx) => (threadIds, archive) => {
    if (!Array.isArray(threadIds)) {
        threadIds = [threadIds];
    }
    const form = {ids: {}};
    for (const threadId of threadIds) {
        form.ids[threadId] = archive;
    }

    return defFunc
        .post('https://www.facebook.com/ajax/mercury/change_archived_status.php', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
        });
};
