'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => (isAdmin, threadId, adminIds) => {
    if (!Array.isArray(adminIds)) {
        adminIds = [adminIds];
    }
    isAdmin = Boolean(isAdmin);
    const form = {
        thread_fbid: threadId,
        admin_ids: adminIds,
        add: isAdmin
    };

    return defFunc
        .post('https://www.facebook.com/messaging/save_admins/', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info(isAdmin ? 'Add admins' : 'Remove admins', adminIds.toString(), threadId);
        })
        .catch(error => {
            log.error('setAdminsForGroup', error.message);
        });
};
