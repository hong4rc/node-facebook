'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (threadId, muteSeconds) => {
    const form = {
        thread_fbid: threadId,
        mute_settings: muteSeconds,
    };

    return defFunc
        .post('https://www.facebook.com/ajax/mercury/change_mute_thread.php', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Muted ', threadId);
        })
        .catch(error => {
            log.error('muteThread', error.message);
        });
};
