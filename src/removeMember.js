'use strict';

const log = require('kiat-log');
let groupId;
let memberId;
let deleteOptions;
const supportType = {
    posts: true,
    comments: true,
    story_threads: true,
    poll_options: true,
    invites: true,
};

module.exports = {
    url: 'https://www.facebook.com/ajax/groups/remove_member/',
    init: (_groupId, _memberId, options = {}) => {
        groupId = _groupId;
        memberId = _memberId;
        deleteOptions = {};
        for (const key in options) {
            if (options.hasOwnProperty(key)) {
                if (!supportType.hasOwnProperty(key)) {
                    log.warn(`We don't support ${key}`);
                    break;
                }
                deleteOptions[`delete_${key}`] = options[key] ? '1' : '0';
            }
        }
    },
    getForm: () => ({
        ...deleteOptions,
        group_id: groupId,
        member_id: memberId,
        source: 'profile_browser',
        is_undo: '0',
        confirmed: true,

    }),
    onSuccess: () => {
        log.info('removeMember', memberId, 'in', groupId);
    },
    onFailure: error => {
        log.error('removeMember', error);
    }
};
