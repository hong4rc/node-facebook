'use strict';

const log = require('kiat-log');

let pageId;
let isBlock;
module.exports = {
    url: 'https://www.facebook.com/privacy/block/page/',
    init: (_pageId, _isBlock = true) => {
        pageId = _pageId;
        isBlock = _isBlock;
    },
    getForm: () => ({
        objectID: pageId,
        remove: !isBlock
    }),

    onSuccess: () => {
        log.info('blockPage', isBlock ? 'Blocked' : 'Unblocked', pageId);
    },
    onFailure: error => {
        log.error('blockPage', error.message);
    }
};
