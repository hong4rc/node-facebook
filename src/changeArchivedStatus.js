'use strict';

const log = require('../utils/log');

let threadIds;
let archive;
module.exports = {
    url: 'https://www.facebook.com/ajax/mercury/change_archived_status.php',
    init: (_threadIds, _archive) => {
        archive = _archive;
        threadIds = _threadIds;
    },
    getForm: () => {

        const form = {ids: {}};
        for (const threadId of threadIds) {
            form.ids[threadId] = archive;
        }

        return form;
    },
    onSuccess: () => {
        log.info('Change archived status', threadIds.toString(), archive);
    },
    onFailure: error => {
        log.error('changeArchivedStatus', error.message);
    }
};
