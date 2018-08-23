'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');
const colors = require('../utils/threadColors');
const FIRST = 0;

module.exports = (defFunc, api, ctx) => (color, threadId) => {
    if (colors.indexOf(color) < FIRST) {
        throw new Error('The color you are trying to use is not a valid thread color.');
    }
    const form = {
        color_choice: color,
        thread_or_other_fbid: threadId,
    };

    return defFunc
        .post('https://www.facebook.com/messaging/save_thread_color/?source=thread_settings', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Change color to', color, threadId);
        })
        .catch(error => {
            log.error('changeThreadColor', error.message);
        });
};
