'use strict';

const log = require('../utils/log');

module.exports = {
    url: 'https://www.facebook.com/ajax/notifications/mark_read.php',
    init: () => {
        log.verbose('Try to mark read notifications');
    },
    getForm: () => ({read: true}),
    onSuccess: () => {
        log.info('Mark read notifications');
    },
    onFailure: error => {
        log.error('markReadNotifications', error);
    }
};
