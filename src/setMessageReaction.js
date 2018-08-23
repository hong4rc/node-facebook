'use strict';
const qString = require('querystring');
const browser = require('../utils/browser');
const log = require('../utils/log');
const DOC_ID = '1491398900900362';

const reactions = {
    angry: '😠',
    dislike: '👎',
    haha: '😆',
    like: '👍',
    love: '😍',
    sad: '😢',
    wow: '😮',
};
const validEmoji = reaction => {
    if (reactions.hasOwnProperty(reaction)) {
        return reactions[reaction];
    }
    return '';
};
module.exports = (defFunc, api, ctx) => (reaction, messageId) => {
    reaction = validEmoji(reaction);
    const variables = JSON.stringify({
        data: {
            client_mutation_id: ctx.clientMutationId++,
            actor_id: ctx.userId,
            action: reaction ? 'ADD_REACTION' : 'REMOVE_REACTION',
            message_id: messageId,
            reaction: reaction,
        },
    });
    const qs = qString.stringify({
        doc_id: DOC_ID,
        variables,
    });

    return defFunc
        .post(`https://www.facebook.com/webgraphql/mutation/?${qs}`, ctx.jar, {})
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Reacted', reaction, messageId);
        })
        .catch(error => {
            log.error('setMessageReaction', error.message);
        });
};
