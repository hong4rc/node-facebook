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
    getPull: form => defFunc.get(browser.getUrlPull(), ctx.jar, form)
        .then(browser.parseAndCheckLogin(ctx, defFunc)),
    get: (url, query) => defFunc.get(url, ctx.jar, query)
        .then(browser.saveCookies(ctx.jar)),
    post: (url, form) => defFunc.post(url, ctx.jar, form),
    loadApi: apiObj => (...args) => {
        apiObj.init(...args);
        let request = defFunc.post;
        if (apiObj.method) {
            request = defFunc[apiObj.method];
        }
        return request(apiObj.url, ctx.jar, apiObj.getForm())
            .then(browser.parseAndCheckLogin(ctx, defFunc))
            .then(res => {
                browser.checkError(res);
                return apiObj.onSuccess(res);
            })
            .catch(error => {
                apiObj.onFailure(error);
                throw error;
            });
    }
};
