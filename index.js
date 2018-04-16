'use strict';
// jar: true to save cookie
let request = require('request').defaults({jar: true});
let cheerio = require('cheerio');
let log = require('npmlog');

const URL_HOME = 'https://www.facebook.com';
const URL_LOGIN = URL_HOME + '/login.php?login_attempt=1&lwv=111';
const QR_LOGIN = '#login_form input';
const DIR_SRC = './src/';
let utils = require('./utils');
const LOCATE = 'en_US';

let getUrlPull = (num = 0) => {
    return 'https://number-edge-chat.facebook.com/pull'.replace('number', num);
};
let makeLogin = (body, jar, user, option) => {
    if (option){
        console.log('Option wil be used in future');
    }
    let $ = cheerio.load(body);
    let form = {};
    $(QR_LOGIN).map((index, elem) => {
        let name = $(elem).attr('name');
        let val = $(elem).val();
        if (val && name) {
            form[name] = val;
        }
    });

    form.email = user.email;
    form.pass = user.pass;
    form.locale = LOCATE;
    form.timezone = new Date().getTimezoneOffset();
    form.lgndim = new Buffer('{"w":1440,"h":900,"aw":1440,"ah":834,"c":24}').toString('base64');
    form.lgnjs = ~~(Date.now() / 1000);
    form.default_persistent = '0';

    log.info('form', form);

    let willBeCookies = body.split('"_js_');
    willBeCookies.slice(1).map(val => {
        let cookieData = JSON.parse('["' + utils.findForm(val, '', ']') + ']');
        jar.setCookie(utils.formatCookie(cookieData, 'facebook.com'), URL_HOME);
    });

    log.info('login', 'Logging in...');
    return utils
        .post(URL_LOGIN, jar, form)
        .then(utils.saveCookies(jar))
        .then(res => {
            let headers = res.headers;
            if (!headers.location) {
                throw {error: 'Wrong username/password.'};
            }

            // This means the account has login approvals turned on.
            if (headers.location.indexOf('https://www.facebook.com/checkpoint/') >= 0) {
                throw new Error('This account is blocked by Facebook !!!');
            }

            return utils
                .get(URL_HOME, jar)
                .then(utils.saveCookies(jar));
        });
};
let createApi = (option, body, jar) => {
    let cUser = jar.getCookies(URL_HOME)
        .filter(val => val.cookieString().split('=')[0] === 'c_user');

    if (cUser.length === 0) {
        throw new Error('Can\'t find your ID.');
    }
    let userID = cUser[0].cookieString().split('=')[1].toString();
    log.info('login', 'Logged in');
    log.info('Your id', userID);
    let clientID = (Math.random() * 2147483648 | 0).toString(16);

    let ctx = {
        userID: userID,
        jar: jar,
        clientID: clientID,
        globalOptions: option,
        loggedIn: true,
        access_token: 'NONE',
        clientMutationId: 0
    };
    let api = {
        getAppState: () => utils.getAppState(jar)
    };
    let apiNames = [
        'sendTyping',
        'listen',
        'markAsRead',
        'sendMessage',
    ];
    let defFunc = utils.makeDefaults(body, userID, ctx);
    apiNames.map(func => {
        api[func] = require(DIR_SRC + func)(defFunc, api, ctx);
    });
    return {ctx, defFunc, api};
};
let login = (user, option) => new Promise((resolve, inject) => {
    let mPromise = undefined;
    let jar = request.jar();
    if (user.appState) {
        user.appState.map(c => {
            let str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
            jar.setCookie(str, "http://" + c.domain);
        });

        mPromise = utils
            .get(URL_HOME, jar)
            .then(utils.saveCookies(jar));
    } else {
        mPromise = utils.get(URL_HOME, null)
            .then(utils.saveCookies(jar))
            .then(res => makeLogin(res.body, jar, user, option))
            .then(() => utils.get(URL_HOME, jar)
                .then(utils.saveCookies(jar)));
    }
    let {ctx, defFunc, api} = {};

    mPromise = mPromise
        .then(res => {
            // Hacky check for the redirection that happens on some ISPs, which doesn't return statusCode 3xx
            let reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
            let redirect = reg.exec(res.body);
            if (redirect && redirect[1]) {
                return utils
                    .get(redirect[1], jar)
                    .then(utils.saveCookies(jar));
            }
            return res;
        })

        .then(res => {
            let stuff = createApi(option, res.body, jar);
            ctx = stuff.ctx;
            defFunc = stuff.defFunc;
            api = stuff.api;
            return res;
        })
        .then(() => {
            let form = {
                reason: 6
            };
            log.info("login", 'Request to reconnect');
            return defFunc
                .get(URL_HOME + '/ajax/presence/reconnect.php', ctx.jar, form)
                .then(utils.saveCookies(ctx.jar));
        })
        .then(() => {
            log.info('login', 'Request to pull 1');
            let form = {
                channel: 'p_' + ctx.userID,
                seq: 0,
                partition: -2,
                clientid: ctx.clientID,
                viewer_uid: ctx.userID,
                uid: ctx.userID,
                state: 'active',
                idle: 0,
                cap: 8,
                msgs_recv: 0
            };

            return utils
                .get(getUrlPull(), ctx.jar, form)
                .then(utils.saveCookies(ctx.jar))
                .then(res => {
                    let body = null;
                    try {
                        body = JSON.parse(utils.makeParsable(res.body));
                    } catch (e) {
                        throw {error: "Error inside first pull request. Received HTML instead of JSON. Logging in inside a browser might help fix this."};
                    }
                    if (body.t !== 'lb') throw {error: "Bad response from pull 1"};
                    return body;
                });
        })
        /* ╔════════════════════════════════════════╗
          ║  remove pull 2 + thread_sync   ║
         ╚════════════════════════════════════════╝*/
        .then(() => {
            log.info("login", 'Done logging in.');
            resolve(api);
        })
        .catch(e => {
            log.error("login", e.error || e);
            inject(e);
        });
    return mPromise;
});


module.exports = login;
