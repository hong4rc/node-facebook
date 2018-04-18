'use strict';
const log = require('../utils/log');
const browser = require('../utils/browser');
const formatter = require('../utils/formatter');

const MILLI_SECOND = 1000;
const MILLI_TIMEOUT = 200;
const SPACE_INDENT = 4;

const identity = () => {
    log.info('This is identity function !!!');
};
module.exports = (defFunc, api, ctx) => {

    let globalCallback = identity;

    const stopListening = () => {
        globalCallback = identity;
        if (currentlyRunning) {
            clearTimeout(currentlyRunning);
            currentlyRunning = null;
        }
    };
    let prev = Date.now();
    let tmpPrev = Date.now();
    let lastSync = ~~(Date.now() / MILLI_SECOND);

    let msgsRecv = 0;
    let currentlyRunning = null;
    const form = {
        channel: `p_${ctx.userId}`,
        seq: '0',
        partition: '-2',
        clientid: ctx.clientId,
        viewer_uid: ctx.userId,
        uid: ctx.userId,
        state: 'active',
        idle: 0,
        cap: '8',
        msgs_recv: msgsRecv,
    };

    const handleMessagingEvents = event => {

        let fmtMsg;
        switch (event.event) {
            case 'read_receipt':
                fmtMsg = formatter.readReceipt(event);
                if (fmtMsg) {
                    globalCallback(null, fmtMsg);
                }
                return true;

            // 'read event' triggers when the user read other people's messages.
            case 'read':
                fmtMsg = formatter.read(event);
                if (fmtMsg) {
                    globalCallback(null, fmtMsg);
                }
                return true;
            default:
                return false;
        }
    };
    const listen = () => {

        form.idle = ~~(Date.now() / MILLI_SECOND) - prev;
        prev = ~~(Date.now() / MILLI_SECOND);

        browser.get(browser.getUrlPull(), ctx.jar, form)
            .then(browser.parseAndCheckLogin(ctx, defFunc))
            .then(body => {
                const now = Date.now();
                log.info('listen', `Got answer in ${now - tmpPrev}`);
                tmpPrev = now;
                log.info('body', JSON.stringify(body, null, SPACE_INDENT));
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
                            .then(browser.saveCookies(ctx.jar))
                            .then(() => {
                                lastSync = ~~(Date.now() / MILLI_SECOND);
                                const formAll = {
                                    client: 'mercury',
                                    'folders[0]': 'inbox',
                                    last_action_timestamp: ~~Date.now()
                                };
                                defFunc.post('https://www.facebook.com/ajax/mercury/thread_sync.php', ctx.jar, formAll)
                                    .then(() => {
                                        currentlyRunning = setTimeout(listen, MILLI_TIMEOUT);
                                    });
                            });
                        break;
                    default:
                        log.verbose(body.t);
                }

                if (body.ms) {
                    msgsRecv += body.ms.length;
                    body.ms
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .forEach(msg => {
                            let attachments,
                                clientPayload,
                                fmtMsg;

                            // deltaflow buddylist_overlay
                            switch (msg.type) {
                                case 'typ':
                                    log.verbose(msg);
                                    msg.isTyping = msg.st;
                                    delete msg.st;
                                    globalCallback(null, msg);
                                    break;
                                case 'chatproxy-presence':
                                    for (const userId in msg.buddyList) {
                                        if (msg.buddyList.hasOwnProperty(userId)) {
                                            fmtMsg = formatter.proxyPresence(msg.buddyList[userId], userId);
                                            if (fmtMsg) {
                                                globalCallback(null, fmtMsg);
                                            }
                                        }

                                    }
                                    break;
                                case 'buddylist_overlay':
                                    for (const userId in msg.buddyList) {
                                        if (msg.buddyList.hasOwnProperty(userId)) {
                                            fmtMsg = formatter.presence(msg.overlay[userId], userId);
                                            if (fmtMsg) {
                                                globalCallback(null, fmtMsg);
                                            }
                                        }
                                    }
                                    break;
                                case 'delta':
                                    switch (msg.delta.class) {
                                        case 'NewMessage':
                                            attachments = msg.delta.attachments;
                                            log.warn('need handle for ', attachments);
                                            fmtMsg = formatter.deltaMessage(msg.delta);
                                            if (fmtMsg) {
                                                globalCallback(null, fmtMsg);
                                            }
                                            break;
                                        case 'ClientPayload':
                                            clientPayload = formatter.clientPayload(msg.delta.payload);
                                            if (clientPayload && clientPayload.deltas) {
                                                for (const delta of clientPayload.deltas) {
                                                    const msgRea = delta.deltaMessageReaction;
                                                    if (msgRea) {
                                                        globalCallback(null, {
                                                            type: 'message_reaction',
                                                            threadId: msgRea.threadKey.threadFbId
                                                            || msgRea.threadKey.otherUserFbId,
                                                            messageId: msgRea.messageId,
                                                            reaction: msgRea.reaction,
                                                            senderId: msgRea.senderId,
                                                            userId: msgRea.userId,
                                                            timestamp: msg.ofd_ts
                                                        });
                                                    }
                                                }
                                                return;
                                            }
                                            break;
                                        default:
                                            log.warn(`${msg.delta.class} is not has case`);
                                            log.warn(JSON.stringify(msg));
                                    }


                                    break;
                                case 'message':
                                    handleMessagingEvents(msg);
                                    break;
                                default:
                                    log.warn(`don't have handle for ${msg.type}`);
                                    log.warn(JSON.stringify(msg));
                            }
                        });

                }


                if (currentlyRunning) {
                    currentlyRunning = setTimeout(listen, MILLI_TIMEOUT);
                }
            })
            .catch(err => {
                if (err.code === 'ETIMEDOUT') {
                    log.info('listen', 'Suppressed timeout error.');
                } else if (err.code === 'EAI_AGAIN') {
                    browser.changeServer();
                } else {
                    log.error('listen', err);
                    globalCallback(err);
                }
                if (currentlyRunning) {
                    currentlyRunning = setTimeout(listen, MILLI_TIMEOUT);
                }
            });
    };
    return callback => {
        globalCallback = callback;

        if (!currentlyRunning) {
            currentlyRunning = setTimeout(listen, MILLI_TIMEOUT);
        }

        return stopListening;
    };
};

