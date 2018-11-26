'use strict';

const log = require('kiat-log');
let itemId;

module.exports = {
    url: 'https://www.facebook.com/ajax/bookmark/add/',
    init: _itemId => {
        itemId = _itemId;
    },
    getForm: () => ({
        id: `navItem_${itemId}`
    }),
    onSuccess: () => {
        log.info('addBookmark', itemId);
    },
    onFailure: error => {
        log.error('addBookmark', error);
    }
};
