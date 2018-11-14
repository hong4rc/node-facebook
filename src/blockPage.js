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
    getForm: () => {
        let form;
        if (isBlock) {
            form = {
                page_id: pageId,
                confirmed: 1
            };
        } else {
            form = {
                objectID: pageId,
                remove: true
            };
        }
        return form;
    },
    onSuccess: () => {
        log.info('blockPage', isBlock ? 'Blocked' : 'Unblocked', pageId);
    },
    onFailure: error => {
        log.error('blockPage', error.message);
    }
};
