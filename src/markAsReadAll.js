'use strict';

const log = require('../utils/log');

module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/mark_folder_as_read.php',
    init: () => {
        log.verbose('Try to init other folder');
    },
    getForm: () => ({folder: 'inbox'}),
    onSuccess: () => {
        log.info('Mark as read all');
    },
    onFailure: error => {
        log.error('markAsReadAll', error);
    }
};
