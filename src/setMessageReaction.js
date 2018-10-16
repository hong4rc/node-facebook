'use strict';

const log = require('../utils/log');
const qString = require('querystring');
const loader = require('./loader');
const DOC_ID = '1491398900900362';

let reaction;
let messageId;

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

module.exports = {
    init: (_reaction, _messageId) => {
        messageId = _messageId;
        reaction = validEmoji(_reaction);

        const ctx = loader.getCtx();
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
        module.exports.url = `https://www.facebook.com/webgraphql/mutation/?${qs}`;

    },
    getForm: () => ({}),
    onSuccess: () => {
        log.info('Reacted', reaction, messageId);
    },
    onFailure: error => {
        log.error('setMessageReaction', error.message);
    }
};
