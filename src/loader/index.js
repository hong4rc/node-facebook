'use strict';

const browser = require('../../utils/browser');

let defFunc;

let api;
let ctx;

module.exports = {
    init: (_defFunc, _api, _ctx) => {
        defFunc = _defFunc;
        api = _api;
        ctx = _ctx;
    },
    getCtx: () => ctx,
    getApi: () => api,
    loadApi: apiObj => (...args) => {
        apiObj.init(...args);
        return defFunc
            .post(apiObj.url, ctx.jar, apiObj.getForm())
            .then(browser.parseAndCheckLogin(ctx, defFunc))
            .then(res => {
                browser.checkError(res);
                return apiObj.onSuccess(res);
            })
            .catch(error => {
                apiObj.onFailure(error);
            });
    }
};