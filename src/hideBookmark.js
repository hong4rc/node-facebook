'use strict';

const log = require('kiat-log');
let itemId;

module.exports = {
    url: 'https://www.facebook.com/ajax/bookmark/hide/',
    init: _itemId => {
        itemId = _itemId;
    },
    getForm: () => ({
        id: `navItem_${itemId}`
    }),
    onSuccess: () => {
        log.info('hideBookmark', itemId);
    },
    onFailure: error => {
        log.error('hideBookmark', error);
    }
};
