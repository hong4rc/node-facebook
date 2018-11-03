'use strict';

const log = require('kiat-log');

let isAdmin;
let threadId;
let adminIds;

module.exports = {
    url: 'https://www.facebook.com/messaging/save_admins/',
    init: (_isAdmin, _threadId, _adminIds) => {
        if (!Array.isArray(_adminIds)) {
            _adminIds = [_adminIds];
        }
        adminIds = _adminIds;
        isAdmin = Boolean(_isAdmin);
        threadId = _threadId;
    },
    getForm: () => ({
        thread_fbid: threadId,
        admin_ids: adminIds,
        add: isAdmin,
    }),
    onSuccess: () => {
        log.info(isAdmin ? 'Add admins' : 'Remove admins', adminIds.toString(), threadId);
    },
    onFailure: error => {
        log.error('setAdminsForGroup', error.message);
    }
};
