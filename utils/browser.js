'use strict';
const log = require('./log');
const request = require('request').defaults({jar: true});

const FIRST = 0;
const START_RETRY_COUNT = 0;
const MAX_RETRY_COUNT = 5;
const ONE = 1;
const I_PATH = 3;
const COUNT_SERVER = 6;
const BASE_36 = 36;
const STT_CODE_OK = 200;
const SERVER_ERROR = 500;
const MAX_RETRY_TIME = 5000;
const ERR_LOGIN = 1357001;

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/600.3.18 (KHTML, like Gecko)'
    + ' Chrome/63.0.3239.84 Version/8.0.3 Safari/600.3.18';
const FAKE_USER_AGENT = process.env.USER_AGENT || DEFAULT_USER_AGENT;
const getHeaders = url => ({
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: 'https://www.facebook.com/',
    Host: url.replace('https://', '').split('/')[FIRST],
    Origin: 'https://www.facebook.com',
    'User-Agent': FAKE_USER_AGENT,
    Connection: 'keep-alive',
});
let serverNumber = 0;
const getUrlPull = () => `https://${serverNumber}-edge-chat.facebook.com/pull`;
const changeServer = () => {
    serverNumber = Math.floor(Math.random() * COUNT_SERVER);
};
const method = method => (url, jar, form, qs) => {
    const option = {
        headers: getHeaders(url),
        timeout: 60000,
        url: url,
        method: method,
        jar: jar,
        gzip: true
    };
    if (method.toUpperCase() === 'GET') {
        option.qs = form;
    } else if (qs) {
        option.formData = form;
        option.qs = qs;
        option.headers['Content-Type'] = 'multipart/form-data';
    } else {
        option.form = form;
    }

    return new Promise(resolve => {
        request(option, (error, res) => {
            resolve(res);
        });
    });
};
const get = method('GET');
const post = method('POST');

const saveCookies = jar => res => {
    const cookies = res.headers['set-cookie'] || [];
    cookies.forEach(c => {
        if (c.indexOf('.facebook.com') >= FIRST) {
            jar.setCookie(c, 'https://www.facebook.com');
        }
        const c2 = c.replace(/domain=\.facebook\.com/, 'domain=.messenger.com');
        jar.setCookie(c2, 'https://www.messenger.com');
    });
    return res;
};
const findForm = (body, head, tail) => {
    const start = body.indexOf(head) + head.length;
    if (start < head.length) {
        return '';
    }

    const lastHalf = body.substring(start);
    const end = lastHalf.indexOf(tail);
    if (end < FIRST) {
        throw Error(`Could not find endTime ${tail} in the given string.`);
    }
    return lastHalf.substring(FIRST, end);
};

const formatCookie = (arr, url) => `${arr[FIRST]}=${arr[ONE]}; Path=${arr[I_PATH]}; Domain=${url}`;
const getAppState = jar => jar
    .getCookies('https://www.facebook.com')
    .concat(jar.getCookies('https://facebook.com'))
    .concat(jar.getCookies('https://www.messenger.com'));
const makeDefaults = (body, id, ctx) => {
    let reqCounter = 1;
    const fb_dtsg = findForm(body, 'name="fb_dtsg" value="', '"');
    let ttstamp = '2';
    for (let i = 0; i < fb_dtsg.length; i++) {
        ttstamp += fb_dtsg.charCodeAt(i);
    }
    const revision = findForm(body, 'revision":', ',');

    const mergeWithDefaults = obj => {
        const mObj = {
            __user: id,
            __req: (reqCounter++).toString(BASE_36),
            __rev: revision,
            __a: 1,
            fb_dtsg: ctx.fb_dtsg ? ctx.fb_dtsg : fb_dtsg,
            jazoest: ctx.ttstamp ? ctx.ttstamp : ttstamp,
        };

        if (!obj) {
            return mObj;
        }

        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (!mObj[prop]) {
                    mObj[prop] = obj[prop];
                }
            }
        }

        return mObj;
    };
    const mergePost = (url, jar, form) => post(url, jar, mergeWithDefaults(form));

    const mergeGet = (url, jar, qs) => get(url, jar, mergeWithDefaults(qs));

    const mergePostForm = (url, jar, form, qs) => post(url, jar, mergeWithDefaults(form), mergeWithDefaults(qs));

    return {
        get: mergeGet,
        post: mergePost,
        postFormData: mergePostForm,
    };
};

const makeParsable = html => {
    const withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, '');
    const objects = withoutForLoop.split(/\}\r\n *\{/);
    if (objects.length === ONE) {
        return objects;
    }

    return `[${objects.join('},{')}]`;
};
const getRequire = jsmods => {
    if (jsmods && jsmods.require && Array.isArray(jsmods.require)) {
        return jsmods.require;
    }
    return null;
};

const parseAndCheckLogin = (ctx, defFunc, retryCount = START_RETRY_COUNT) => data => {
    log.verbose('parseAndCheckLogin', data.body);
    if (data.statusCode >= SERVER_ERROR) {
        if (retryCount >= MAX_RETRY_COUNT) {
            throw {
                error: 'Request retry failed. Check the `res` and `statusCode` property on this error.',
                statusCode: data.statusCode, res: data.body
            };
        }
        retryCount++;
        const retryTime = Math.floor(Math.random() * MAX_RETRY_TIME);
        log.warn('LG', `Got status code ${data.statusCode} - ${retryCount}. attempt to retry in ${retryTime} ms`);
        const url = data.request.uri.href;
        let mPost = defFunc.post;
        if (data.request.headers['Content-Type'].split(';')[FIRST] === 'multipart/form-data') {
            mPost = defFunc.postFormData;
        }
        return new Promise(rel => setTimeout(() => rel(), retryTime))
            .then(() => mPost(url, ctx.jar, data.request.formData, {}))
            .then(parseAndCheckLogin(ctx, defFunc, retryCount));
    }
    if (data.statusCode !== STT_CODE_OK) {
        throw new Error(`got status code: ${data.statusCode}. Bailing out of trying to parse response.`);
    }

    let res = null;
    try {
        res = JSON.parse(makeParsable(data.body));
    } catch (e) {
        throw {
            error: 'JSON.parse error. Check the `detail` property on this error.',
            detail: e,
            res: data.body
        };
    }

    const jRequire = getRequire(res.jsmods);

    // TODO change FIRST, ONE, I_PATH to real constant
    if (jRequire && Array.isArray(jRequire[FIRST]) && jRequire[FIRST][FIRST] === 'Cookie') {
        log.info('jRequire', jRequire);
        const jCookie = jRequire[FIRST][I_PATH];
        jCookie[FIRST] = jCookie[FIRST].replace('_js_', '');
        const cookie = formatCookie(jCookie, 'facebook');
        const cookie2 = formatCookie(jCookie, 'messenger');
        ctx.jar.setCookie(cookie, 'https://www.facebook.com');
        ctx.jar.setCookie(cookie2, 'https://www.messenger.com');
    }

    // On every request we check if we got a DTSG and we mutate the context so that we use the latest
    // one for the next requests.
    if (jRequire) {
        for (const item of jRequire) {
            if (item[FIRST] === 'DTSG' && item[ONE] === 'setToken') {
                ctx.fb_dtsg = item[I_PATH][FIRST];

                // Update ttstamp since that depends on fb_dtsg
                ctx.ttstamp = '2';
                for (let i = 0; i < ctx.fb_dtsg.length; i++) {
                    ctx.ttstamp += ctx.fb_dtsg.charCodeAt(i);
                }
            }
        }
    }

    if (res.error === ERR_LOGIN) {
        throw {error: 'Not logged in.'};
    }
    return res;
};
module.exports = {
    get,
    post,
    saveCookies,
    findForm,
    formatCookie,
    getAppState,
    makeDefaults,
    getUrlPull,
    changeServer,
    makeParsable,
    parseAndCheckLogin
};
