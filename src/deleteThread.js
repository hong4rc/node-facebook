'use strict';

const log = require('kiat-log');

let ids;

module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/delete_thread.php',
    init: _ids => {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        ids = _ids;
    },
    getForm: () => ({
        ids,
    }),
    onSuccess: () => {
        log.info('Deleted thread', ids.toString());
    },
    onFailure: error => {
        log.error('deleteThread', error.message);
    }
};
