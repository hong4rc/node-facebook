'use strict';
const browser = require('../utils/browser');

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
        });
};
