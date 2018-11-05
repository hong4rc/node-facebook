'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request').defaults({jar: true});
const cheerio = require('cheerio');
const log = require('kiat-log');
const browser = require('./utils/browser');
const loader = require('./src/loader');

const URL_HOME = 'https://www.facebook.com';
const URL_LOGIN = `${URL_HOME}/login.php?login_attempt=1&lwv=111`;
const REDIRECT_URL = 1;
const QR_LOGIN = '#login_form input';
const DIR_SRC = path.join(__dirname, 'src/');
const DIR_RAW_API = path.join(DIR_SRC, 'raw/');
const LOCATE = 'en_US';
const FIRST = 0;
const COOKIE_VALUE = 1;
const HEX = 16;
const MILLIS = 1000;
const POWER_2_31 = 2147483648;

const checkLoginErr = (res, jar) => {
    const headers = res.headers;
    if (!headers.location) {
        throw new Error('Wrong username/password.');
    }

    // This means the account has login approvals turned on.
    if (headers.location.indexOf('https://www.facebook.com/checkpoint/') >= FIRST) {
        throw new Error('This account is blocked by Facebook !!!');
    }

    return browser.get(URL_HOME, jar);
};
const makeLogin = (body, jar, user, option) => {
    if (option) {
        log.info('Option wil be used in future');
    }
    const $ = cheerio.load(body);
    const form = {
        email: user.email,
        pass: user.pass,
        locale: LOCATE,
        timezone: new Date().getTimezoneOffset(),
        lgndim: new Buffer('{"w":1440,"h":900,"aw":1440,"ah":834,"c":24}').toString('base64'),
        lgnjs: ~~(Date.now() / MILLIS),
        default_persistent: '0'
    };
    $(QR_LOGIN).map((index, elem) => {
        const name = $(elem).attr('name');
        const val = $(elem).val();
        if (val && name && !form.hasOwnProperty(name)) {
            form[name] = val;
        }
    });

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
        .then(res => checkLoginErr(res, jar));
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
    const defFunc = browser.makeDefaults(body, userId, ctx);

    loader.init(defFunc, api, ctx);
    const loadApi = (src, converter) => {
        const apiNames = fs.readdirSync(src);
        for (let func of apiNames) {
            if (fs.statSync(src + func).isFile()) {
                func = func.replace(/\.js$/, '');
                api[func] = converter(require(path.join(src, func)));
            }
        }
    };
    loadApi(DIR_SRC, loader.loadApi);
    loadApi(DIR_RAW_API, api => api);

    return {ctx, api};
};


// Handle for login

const reconnect = () => {
    const form = {
        reason: 6,
    };
    log.info('login', 'Request to reconnect');
    return loader.get(`${URL_HOME}/ajax/presence/reconnect.php`, form);
};
const autoRedirect = (res, jar) => {

    // Hacky check for the redirection that happens on some ISPs, which doesn't return statusCode 3xx
    const reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
    const redirect = reg.exec(res.body);
    const url = redirect && redirect[REDIRECT_URL];
    if (url) {
        return browser.get(url, jar);
    }
    return res;
};
const requestToPull = () => {
    log.info('login', 'Request to pull !!!');
    const ctx = loader.getCtx();
    const form = browser.formPull(ctx);

    return browser
        .get(browser.getUrlPull(), ctx.jar, form)
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
};

const saveCookie = (jar, cookies) => {
    for (const c of cookies) {
        const str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
        jar.setCookie(str, `http://${c.domain}`);
    }
};

const login = (user, option) => {
    let mPromise = Promise.resolve();
    const jar = request.jar();
    if (user.appState) {
        saveCookie(jar, user.appState);
    } else {
        mPromise = browser.get(URL_HOME, jar)
            .then(res => makeLogin(res.body, jar, user, option));
    }

    return mPromise.then(() => browser.get(URL_HOME, jar))
        .then(autoRedirect)
        .then(res => createApi(option, res.body, jar))
        .then(reconnect)
        .then(requestToPull)
        .then(() => {
            log.info('login', 'Done logging in.');
            return loader.getApi();
        })
        .catch(e => {
            log.error('login', e);
            throw new Error(e);
        });
};

module.exports = login;
