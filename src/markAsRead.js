'use strict';

let utils = require('../utils');
let log = require('npmlog');

module.exports = (defFunc, api, ctx) => threadId => {

    let form = {
        shouldSendReadReceipt: true,
    };
    form['ids[' + threadId + ']'] = true;

    defFunc
        .post('https://www.facebook.com/ajax/mercury/change_read_status.php', ctx.jar, form)
        .then(utils.saveCookies(ctx.jar))
        .then(utils.parseAndCheckLogin(ctx, defFunc))
        .then(body => {
            if (body.error) {
                throw body.error;
            }
        })
        .catch(err => {
            log.error('markAsRead', err);
            return err;
        });
};
