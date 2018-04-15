'use strict';
let fs = require('fs');
let log = require('npmlog');
let request = require('request').defaults({jar: true});

let getHeaders = url => {
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://www.facebook.com/',
        'Host': url.replace('https://', '').split('/')[0],
        'Origin': 'https://www.facebook.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/600.3.18 (KHTML, like Gecko) Chrome/63.0.3239.84 Version/8.0.3 Safari/600.3.18',
        'Connection': 'keep-alive',
    }
};
let method = (method) => (url, jar, form, qs) => {
    let option = {
        headers: getHeaders(url),
        timeout: 60000,
        url: url,
        method: method,
        jar: jar,
        gzip: true
    };
    if (method.toUpperCase() === 'GET') {
        option.qs = form;
    } else {
        option.form = form
    }
    if (qs) {
        option.qs = qs;
        option.headers["Content-Type"] = "multipart/form-data";
    }

    return new Promise(resolve => {
        request(option, (err, res) => {
            resolve(res);
        })
    });
};
let get = method('GET');
let post = method('POST');

let saveCookies = (jar) => res => {
    let cookies = res.headers['set-cookie'] || [];
    cookies.forEach(c => {
        console.log(c);
        if (c.indexOf('.facebook.com') > -1) {
            jar.setCookie(c, 'https://www.facebook.com');
        }
        let c2 = c.replace(/domain=\.facebook\.com/, 'domain=.messenger.com');
        jar.setCookie(c2, 'https://www.messenger.com');
    });
    return res;
};
let findForm = (body, head, tail) => {
    let start = body.indexOf(head) + head.length;
    if (start < head.length) return "";

    let lastHalf = body.substring(start);
    let end = lastHalf.indexOf(tail);
    if (end === -1) {
        throw Error(`Could not find endTime ${tail} in the given string.`);
    }
    return lastHalf.substring(0, end);
};

let formatCookie = (arr, url) => {
    return arr[0] + '=' + arr[1] + '; Path=' + arr[3] + '; Domain=' + url;
};
let getAppState = jar => jar
    .getCookies('https://www.facebook.com')
    .concat(jar.getCookies('https://facebook.com'))
    .concat(jar.getCookies('https://www.messenger.com'));
let makeDefaults = (body, id, ctx) => {
    let reqCounter = 1;
    let fb_dtsg = findForm(body, 'name="fb_dtsg" value="', '"');
    let ttstamp = '2';
    for (let i = 0; i < fb_dtsg.length; i++) {
        ttstamp += fb_dtsg.charCodeAt(i);
    }
    let revision = findForm(body, 'revision":', ',');

    let mergeWithDefaults = (obj) => {
        let mObj = {
            __user: id,
            __req: (reqCounter++).toString(36),
            __rev: revision,
            __a: 1,
            fb_dtsg: ctx.fb_dtsg ? ctx.fb_dtsg : fb_dtsg,
            jazoest: ctx.ttstamp ? ctx.ttstamp : ttstamp,
        };

        if (!obj) return mObj;

        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (!mObj[prop]) {
                    mObj[prop] = obj[prop];
                }
            }
        }

        return mObj;
    };
    let mergePost = (url, jar, form) => {
        return post(url, jar, mergeWithDefaults(form));
    };

    let mergeGet = (url, jar, qs) => {
        return get(url, jar, mergeWithDefaults(qs));
    };

    let mergePostForm = (url, jar, form, qs) => {
        return post(url, jar, mergeWithDefaults(form), mergeWithDefaults(qs));
    };

    return {
        get: mergeGet,
        post: mergePost,
        postFormData: mergePostForm,
    };
};

let h = /%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a|%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a|%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1|%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a|%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a|%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a|%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a|%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a|.channel%22%2c%22sub%22%3a%5b1%5d|%5d%2c%22f%22%3anull%2c%22uct%22%3a|%2c%22ud%22%3a100%2c%22lc%22%3a0|%2c%22sb%22%3a1%2c%22t%22%3a%5b|.channel%22%2c%22sub%22%3a%5b|%7b%22v%22%3a2%2c%22time%22%3a1|%2c%22ch%22%3a%7b%22h%22%3a%22|%2c%22pt%22%3a0%2c%22vis%22%3a|%22%3a%7b%22i%22%3a0%7d|%2c%22n%22%3a%22%|%2c%22bls%22%3a|%2c%22ut%22%3a1|%22%3a|%2c%22|%7b%22|%7d|000|%2|%/g;
let i = {
    '%': '_',
    '%2': 'A',
    '000': 'B',
    '%7d': 'C',
    '%7b%22': 'D',
    '%2c%22': 'E',
    '%22%3a': 'F',
    '%2c%22ut%22%3a1': 'G',
    '%2c%22bls%22%3a': 'H',
    '%2c%22n%22%3a%22%': 'I',
    '%22%3a%7b%22i%22%3a0%7d': 'J',
    '%2c%22pt%22%3a0%2c%22vis%22%3a': 'K',
    '%2c%22ch%22%3a%7b%22h%22%3a%22': 'L',
    '%7b%22v%22%3a2%2c%22time%22%3a1': 'M',
    '.channel%22%2c%22sub%22%3a%5b': 'N',
    '%2c%22sb%22%3a1%2c%22t%22%3a%5b': 'O',
    '%2c%22ud%22%3a100%2c%22lc%22%3a0': 'P',
    '%5d%2c%22f%22%3anull%2c%22uct%22%3a': 'Q',
    '.channel%22%2c%22sub%22%3a%5b1%5d': 'R',
    '%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a': 'S',
    '%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a': 'T',
    '%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a': 'U',
    '%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a': 'V',
    '%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a': 'W',
    '%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1': 'X',
    '%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a': 'Y',
    '%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a': 'Z'
};

let presenceEncode = (str) => {
    return encodeURIComponent(str)
        .replace(/([_A-Z])|%../g, (m, n) => n ? '%' + n.charCodeAt(0).toString(16) : m)
        .toLowerCase().replace(h, m => i[m]);
};

let generatePresence = (userID) => {
    let time = Date.now();
    return 'E' + presenceEncode(JSON.stringify({
        v: 3,
        time: parseInt(time / 1000, 10),
        user: userID,
        state: {
            ut: 0,
            t2: [],
            lm2: null,
            uct2: time,
            tr: null,
            tw: Math.floor(Math.random() * 4294967295) + 1,
            at: time
        },
        ch: {
            ['p_' + userID]: 0
        }
    }));
};

let generateA11yCookie = () => {
    let time = Date.now();
    return encodeURIComponent(
        JSON.stringify({
                sr: 0,
                'sr-ts': time,
                jk: 0,
                'jk-ts': time,
                kb: 0,
                'kb-ts': time,
                hcm: 0,
                'hcm-ts': time
            }
        ));
};

let makeParsable = (html) => {
    let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, '');
    let maybeMultipleObjects = withoutForLoop.split(/\}\r\n *\{/);
    if (maybeMultipleObjects.length === 1) return maybeMultipleObjects;

    return '[' + maybeMultipleObjects.join('},{') + ']';
};


let parseAndCheckLogin = (ctx, defFunc, retryCount = 0) => {
    //TODO: try to understand it
    return data => {
        log.verbose('parseAndCheckLogin', data.body);
        if (data.statusCode >= 500 && data.statusCode < 600) {
            if (retryCount >= 5) {
                throw {
                    error:
                        'Request retry failed. Check the `res` and `statusCode` property on this error.',
                    statusCode: data.statusCode,
                    res: data.body
                };
            }
            retryCount++;
            let retryTime = Math.floor(Math.random() * 5000);
            log.warn('parseAndCheckLogin', `Got status code ${data.statusCode} - ${retryCount}. attempt to retry in ${retryTime} ms`);
            let url = data.request.uri.href;
            let mPost = defFunc.post;
            if (data.request.headers['Content-Type'].split(';')[0] === 'multipart/form-data') {
                mPost = defFunc.postFormData;
            }
            return new Promise(rel => setTimeout(() => rel(), retryTime))
                .then(() => mPost(url, ctx.jar, data.request.formData, {}))
                .then(parseAndCheckLogin(ctx, defFunc, retryCount))
        }
        if (data.statusCode !== 200)
            throw new Error(
                'parseAndCheckLogin got status code: ' +
                data.statusCode +
                '. Bailing out of trying to parse response.'
            );

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

        // TODO: handle multiple cookies?
        if (
            res.jsmods &&
            res.jsmods.require &&
            Array.isArray(res.jsmods.require[0]) &&
            res.jsmods.require[0][0] === 'Cookie'
        ) {
            res.jsmods.require[0][3][0] = res.jsmods.require[0][3][0].replace('_js_', '');
            let cookie = formatCookie(res.jsmods.require[0][3], 'facebook');
            let cookie2 = formatCookie(res.jsmods.require[0][3], 'messenger');
            ctx.jar.setCookie(cookie, 'https://www.facebook.com');
            ctx.jar.setCookie(cookie2, 'https://www.messenger.com');
        }

        // On every request we check if we got a DTSG and we mutate the context so that we use the latest
        // one for the next requests.
        if (res.jsmods && Array.isArray(res.jsmods.require)) {
            let arr = res.jsmods.require;
            for (let i in arr) {
                if (arr[i][0] === 'DTSG' && arr[i][1] === 'setToken') {
                    ctx.fb_dtsg = arr[i][3][0];

                    // Update ttstamp since that depends on fb_dtsg
                    ctx.ttstamp = '2';
                    for (let i = 0; i < ctx.fb_dtsg.length; i++) {
                        ctx.ttstamp += ctx.fb_dtsg.charCodeAt(i);
                    }
                }
            }
        }

        if (res.error === 1357001) {
            throw {error: 'Not logged in.'};
        }
        return res;
    };
};


let generateOfflineThreadingID = () => {
    let ret = Date.now();
    let value = Math.floor(Math.random() * 4294967296);
    let msg = (ret * 4194304 + value).toString(2);
    return parseInt(msg, 2);
};
module.exports = {
    get,
    post,
    saveCookies,
    findForm,
    formatCookie,
    getAppState,
    makeDefaults,
    generatePresence,
    generateA11yCookie,
    generateOfflineThreadingID,
    makeParsable,
    parseAndCheckLogin
};