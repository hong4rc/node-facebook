'use strict';
const qString = require('querystring');
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (threadId, block) => {
    if (block) {
        let query = {
            thread_fbid: threadId,
            location: 'www_chat_head',
            action_name: 'BLOCK_MESSAGES'
        };
        query = qString.stringify(query);

        return defFunc
            .post(`https://www.facebook.com/nfx/block_messages/confirm/?${query}`, ctx.jar, {})
            .then(browser.parseAndCheckLogin(ctx, defFunc))
            .then(res => {
                browser.checkError(res);
                log.info('Blocked', threadId);
            })
            .catch(error => {
                log.error('changeBlockedStatus', error.message);
            });
    } else {
        let query = {
            reportable_ent_token: threadId,
            initial_action_name: 'BLOCK_MESSAGES'
        };
        query = JSON.stringify(query);

        return defFunc
            .post(`https://www.facebook.com/ajax/nfx/messenger_undo_block?context=${query}`, ctx.jar, {})
            .then(browser.parseAndCheckLogin(ctx, defFunc))
            .then(res => {
                browser.checkError(res);
                log.info('Unblock', threadId);
            })
            .catch(error => {
                log.error('changeBlockedStatus', error.message);
            });
    }
};
