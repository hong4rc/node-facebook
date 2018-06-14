'use strict';
const browser = require('../utils/browser');

module.exports = (defFunc, api, ctx) => (threadId, muteSeconds) => {
    const form = {
        thread_fbid: threadId,
        mute_settings: muteSeconds
    };
    return defFunc
        .post('https://www.facebook.com/ajax/mercury/change_mute_thread.php', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
        });
};
