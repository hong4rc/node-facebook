'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (emoji, threadId) => {
    const form = {
        emoji_choice: emoji,
        thread_or_other_fbid: threadId
    };

    return defFunc
        .post('https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('change emoji', emoji, `(${threadId})`);
        })
        .catch(error => {
            log.error('changeThreadEmoji', error.message);
        });
};
