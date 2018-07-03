'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (title, threadId, options) => {
    const form = {
        question_text: title,
        target_id: threadId,
        option_text_array: [],
        option_is_selected_array: [],
    };
    for (const option in options) {
        if (options.hasOwnProperty(option)) {
            const selected = Number(options[option]);
            form.option_text_array.push(option);
            form.option_is_selected_array.push(selected);
        }
    }

    return defFunc
        .post('https://www.facebook.com/messaging/group_polling/create_poll/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Added question:', title, 'with', threadId);
        })
        .catch(error => {
            log.error('createPoll', error.message);
        });
};
