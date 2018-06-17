'use strict';
const qString = require('querystring');
const browser = require('../utils/browser');
const log = require('../utils/log');
const DOC_ID = '1491398900900362';

const validEmoji = reaction => {
    switch (reaction) {

        // :heart_eyes:
        case '\uD83D\uDE0D':
            break;

        // :laughing:
        case '\uD83D\uDE06':
            break;

        // :open_mouth:
        case '\uD83D\uDE2E':
            break;

        // :cry:
        case '\uD83D\uDE22':
            break;

        // :angry:
        case '\uD83D\uDE20':
            break;

        // :thumbsup:
        case '\uD83D\uDC4D':
            break;

        // :thumbsdown:
        case '\uD83D\uDC4E':
            break;

        // valid
        case '':
            break;
        case ':heart_eyes:':
        case ':love:':
            reaction = '\uD83D\uDE0D';
            break;
        case ':laughing:':
        case ':haha:':
            reaction = '\uD83D\uDE06';
            break;
        case ':open_mouth:':
        case ':wow:':
            reaction = '\uD83D\uDE2E';
            break;
        case ':cry:':
        case ':sad:':
            reaction = '\uD83D\uDE22';
            break;
        case ':angry:':
            reaction = '\uD83D\uDE20';
            break;
        case ':thumbsup:':
        case ':like:':
            reaction = '\uD83D\uDC4D';
            break;
        case ':thumbsdown:':
        case ':dislike:':
            reaction = '\uD83D\uDC4E';
            break;
        default:
            reaction = '';
    }
    return reaction;
};
module.exports = (defFunc, api, ctx) => (reaction, messageId) => {
    reaction = validEmoji(reaction);
    const variables = JSON.stringify({
        data: {
            client_mutation_id: ctx.clientMutationId++,
            actor_id: ctx.userId,
            action: reaction ? 'ADD_REACTION' : 'REMOVE_REACTION',
            message_id: messageId,
            reaction: reaction
        }
    });
    const qs = qString.stringify({
        doc_id: DOC_ID,
        variables
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
