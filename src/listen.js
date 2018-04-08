"use strict";
let log = require('npmlog');
let utils = require('./utils');
let formatter = require('./formatter');

let mCallback;
let identity = () => {
};
module.exports = (defFunc, api, ctx) => {

    let globalCallback = identity;

    let stopListening = function () {
        globalCallback = identity;
        if (currentlyRunning) {
            clearTimeout(currentlyRunning);
            currentlyRunning = null;
        }
    };
    let prev = Date.now();
    let tmpPrev = Date.now();
    let lastSync = ~~(Date.now() / 1000);

    let msgsRecv = 0;
    let currentlyRunning = null;
    let form = {
        channel: "p_" + ctx.userID,
        seq: "0",
        partition: "-2",
        clientid: ctx.clientID,
        viewer_uid: ctx.userID,
        uid: ctx.userID,
        state: "active",
        idle: 0,
        cap: "8",
        msgs_recv: msgsRecv,
    };

    let listen = (callback) => {
        mCallback = callback;

        form.idle = ~~(Date.now() / 1000) - prev;
        prev = ~~(Date.now() / 1000);

        utils.get("https://0-edge-chat.facebook.com/pull", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defFunc))
            .then(body => {
                if (body.seq) {
                    form.seq = body.seq;
                }
                if (body.tr) {
                    form.traceid = body.tr;
                }
                switch (body.t) {
                    case 'lb':
                        form.sticky_token = body.lb_info.sticky;
                        form.sticky_pool = body.lb_info.pool;
                        break;
                    case 'fullReload':
                        delete form.sticky_pool;
                        delete form.sticky_token;
                        defFunc.get('https://www.facebook.com/notifications/sync/', ctx.jar, {lastSync})
                            .then(utils.saveCookies(ctx.jar))
                            .then(() => {
                                lastSync = ~~(Date.now() / 1000);
                                let formAll = {
                                    client: 'mercury"',
                                    'folders[0]': 'inbox',
                                    last_action_timestamp: ~~(Date.now() - 60)
                                };
                                defFunc.post("https://www.facebook.com/ajax/mercury/thread_sync.php", ctx.jar, formAll)
                                    .then((res) => {
                                        currentlyRunning = setTimeout(listen, 1000);
                                    });
                            });
                        return null;
                        break;
                }

                if (body.ms) {
                    msgsRecv += body.ms.length;
                    let atLeastOne = false;
                    body.ms.sort(function (a, b) {
                        console.log('a', a);
                        return a.timestamp - b.timestamp;
                    })
                        .forEach(msg => {
                            switch (msg.type) {
                                //deltaflow buddylist_overlay
                                case 'typ':
                                    //TODO: check to return
                                    console.log(msg);
                                    msg.isTyping = msg.st;
                                    delete msg.st;

                                    globalCallback(null, msg);
                                    break;
                                case 'chatproxy-presence':
                                    for (let userID in msg.buddyList) {
                                        let formattedPresence = formatter.proxyPresence(msg.buddyList[userID], userID);
                                        if (formattedPresence !== null) {
                                            globalCallback(null, formattedPresence);
                                        }
                                    }
                                    break;
                                case 'buddylist_overlay':
                                    for (let userID in msg.buddyList) {
                                        let formattedPresence = formatter.presence(msg.overlay[userID], userID);
                                        if (formattedPresence !== null) {
                                            globalCallback(null, formattedPresence);
                                        }
                                    }
                                    break;
                                case 'delta':
                                    switch (msg.delta.class) {
                                        case 'NewMessage':
                                            let attachments = msg.delta.attachments;
                                            let fmtMsg = formatter.deltaMessage(msg);
                                            globalCallback(null, fmtMsg);
                                            break;
                                        default:
                                            log.warn(msg.delta.class + ' is not has case');
                                            log.warn(JSON.stringify(msg))
                                    }


                                    break;

                                default:
                                    log.warn('don\'t have handle for ' + msg.type);
                                    log.warn(JSON.stringify(msg));
                            }
                        })
                }


                if (currentlyRunning) {
                    currentlyRunning = setTimeout(listen, Math.random() * 200 + 50);
                }
            })
            .catch(function (err) {
                if (err.code === "ETIMEDOUT") {
                    log.info("listen", "Suppressed timeout error.");
                } else if (err.code === "EAI_AGAIN") {
                } else {
                    log.error("listen", err);
                    globalCallback(err);
                }
                if (currentlyRunning) {
                    currentlyRunning = setTimeout(listen, Math.random() * 200 + 50);
                }
            });
    };
    return function (callback) {
        globalCallback = callback;

        if (!currentlyRunning) {
            currentlyRunning = setTimeout(listen, Math.random() * 200 + 50, callback);
        }

        return stopListening;
    };
};

