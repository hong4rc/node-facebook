'use strict';

const log = require('kiat-log');
let groupId;
let activityId;

module.exports = {
    init: (_groupId, _activityId) => {
        groupId = _groupId;
        activityId = _activityId;
        module.exports = `https://www.facebook.com/groups/${groupId}/write_async/activity_undo/`;
    },
    getForm: () => ({
        activity_id: activityId
    }),
    onSuccess: () => {
        log.info('undo', activityId, 'in', groupId);
    },
    onFailure: error => {
        log.error('undoActivityGroup', error);
    }
};
