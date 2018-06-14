'use strict';
const browser = require('../utils/browser');

module.exports = (defFunc, api, ctx) => (nickname, threadId, participantId) => {
    participantId = participantId || threadId;
    const form = {
        nickname,
        thread_or_other_fbid: threadId,
        participant_id: participantId
    };

    return defFunc
        .post('https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
        });
};
