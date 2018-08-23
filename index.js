'use strict';
const request = require('request').defaults({jar: true});
const cheerio = require('cheerio');
const log = require('./utils/log');
const browser = require('./utils/browser');

const URL_HOME = 'https://www.facebook.com';
const URL_LOGIN = `${URL_HOME}/login.php?login_attempt=1&lwv=111`;
const REDIRECT_URL = 1;
const QR_LOGIN = '#login_form input';
const DIR_SRC = './src/';
const LOCATE = 'en_US';
const FIRST = 0;
const COOKIE_VALUE = 1;
const HEX = 16;
const MILLIS = 1000;
const POWER_2_31 = 2147483648;

const makeLogin = (body, jar, user, option) => {
    if (option) {
        log.info('Option wil be used in future');
    }
    const $ = cheerio.load(body);
    const form = {};
    $(QR_LOGIN).map((index, elem) => {
        const name = $(elem).attr('name');
        const val = $(elem).val();
        if (val && name) {
            form[name] = val;
        }
    });

    form.email = user.email;
    form.pass = user.pass;
    form.locale = LOCATE;
    form.timezone = new Date().getTimezoneOffset();
    form.lgndim = new Buffer('{"w":1440,"h":900,"aw":1440,"ah":834,"c":24}').toString('base64');
    form.lgnjs = ~~(Date.now() / MILLIS);
    form.default_persistent = '0';

    log.info('form', form);

    const willBeCookies = body.split('"_js_');
    willBeCookies.shift();
    willBeCookies.map(val => {
        const cookieData = JSON.parse(`["${browser.findForm(val, '', ']')}]`);
        jar.setCookie(browser.formatCookie(cookieData, 'facebook.com'), URL_HOME);
    });

    log.info('login', 'Logging in...');
    return browser
        .post(URL_LOGIN, jar, form)
        .then(browser.saveCookies(jar))
        .then(res => {
            const headers = res.headers;
            if (!headers.location) {
                throw new Error('Wrong username/password.');
            }

            // This means the account has login approvals turned on.
            if (headers.location.indexOf('https://www.facebook.com/checkpoint/') >= FIRST) {
                throw new Error('This account is blocked by Facebook !!!');
            }

            return browser
                .get(URL_HOME, jar)
                .then(browser.saveCookies(jar));
        });
};
const createApi = (option, body, jar) => {
    const cUser = jar.getCookies(URL_HOME)
        .filter(val => val.cookieString().split('=')[FIRST] === 'c_user');

    if (cUser.length === FIRST) {
        throw new Error('Can\'t find your Id.');
    }
    const userId = cUser[FIRST].cookieString().split('=')[COOKIE_VALUE].toString();
    log.info('login', 'Logged in');
    log.info('Your id', userId);
    const clientId = (Math.random() * POWER_2_31).toString(HEX);

    const ctx = {
        userId: userId,
        jar: jar,
        clientId: clientId,
        globalOptions: option,
        loggedIn: true,
        access_token: 'NONE',
        clientMutationId: 0,
    };
    const api = {
        getAppState: () => browser.getAppState(jar),
    };
    const apiNames = [
        'getUserInfo',
        'addUserToGroup',
        'sendTyping',
        'listen',
        'markAsRead',
        'sendMessage',
        'setTitle',
        'deleteThread',
        'removeUserFromGroup',
        'muteThread',
        'changeArchivedStatus',
        'changeBlockedStatus',
        'changeNickname',
        'handleMessageRequest',
        'changeThreadEmoji',
        'createPoll',
        'setApprovalGroup',
        'deleteMessage',
        'changeThreadColor',
        'forwardAttachment',
        'getCurrentUserId',
        'getEmojiUrl',
        'setAdminsForGroup',
        'getFriendList',
        'setMessageReaction',
    ];
    const defFunc = browser.makeDefaults(body, userId, ctx);
    apiNames.map(func => {
        api[func] = require(DIR_SRC + func)(defFunc, api, ctx);
    });
    return {ctx, defFunc, api};
};
const login = (user, option) => new Promise((resolve, inject) => {
    let mPromise = undefined;
    const jar = request.jar();
    if (user.appState) {
        user.appState.map(c => {
            const str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
            jar.setCookie(str, `http://${c.domain}`);
        });

        mPromise = browser.get(URL_HOME, jar)
            .then(browser.saveCookies(jar));
    } else {
        mPromise = browser.get(URL_HOME, null)
            .then(browser.saveCookies(jar))
            .then(res => makeLogin(res.body, jar, user, option))
            .then(() => browser.get(URL_HOME, jar)
                .then(browser.saveCookies(jar)));
    }
    let {ctx, defFunc, api} = {};

    mPromise = mPromise
        .then(res => {

            // Hacky check for the redirection that happens on some ISPs, which doesn't return statusCode 3xx
            const reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
            const redirect = reg.exec(res.body);
            const url = redirect && redirect[REDIRECT_URL];
            if (url) {
                return browser
                    .get(url, jar)
                    .then(browser.saveCookies(jar));
            }
            return res;
        })

        .then(res => {
            const stuff = createApi(option, res.body, jar);
            ctx = stuff.ctx;
            defFunc = stuff.defFunc;
            api = stuff.api;
            return res;
        })
        .then(() => {
            const form = {
                reason: 6,
            };
            log.info('login', 'Request to reconnect');
            return defFunc
                .get(`${URL_HOME}/ajax/presence/reconnect.php`, ctx.jar, form)
                .then(browser.saveCookies(ctx.jar));
        })
        .then(() => {
            log.info('login', 'Request to pull !!!');
            const form = {
                channel: `p_${ctx.userId}`,
                seq: 0,
                partition: -2,
                clientid: ctx.clientId,
                viewer_uid: ctx.userId,
                uid: ctx.userId,
                state: 'active',
                idle: 0,
                cap: 8,
                msgs_recv: 0,
            };

            return browser
                .get(browser.getUrlPull(), ctx.jar, form)
                .then(browser.saveCookies(ctx.jar))
                .then(res => {
                    let body = null;
                    try {
                        body = JSON.parse(browser.makeParsable(res.body));
                    } catch (e) {
                        throw new Error('Received HTML instead of JSON.');
                    }
                    if (body.t !== 'lb') {
                        throw new Error('Bad response from pull 1');
                    }
                    return body;
                });
        })
        .then(() => {
            log.info('login', 'Done logging in.');
            resolve(api);
        })
        .catch(e => {
            log.error('login', e);
            inject(e);
        });
    return mPromise;
});

module.exports = login;
