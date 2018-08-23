'use strict';
const browser = require('../utils/browser');
const log = require('../utils/log');

module.exports = (defFunc, api, ctx) => ids => {
    if (!Array.isArray(ids)) {
        ids = [ids];
    }
    const form = {};
    form.ids = ids;

    return defFunc
        .post('https://www.facebook.com/ajax/mercury/delete_thread.php', ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc))
        .then(res => {
            browser.checkError(res);
            log.info('Deleted thread', ids.toString());
        })
        .catch(error => {
            log.error('deleteThread', error.message);
        });
};
