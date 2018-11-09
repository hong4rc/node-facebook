'use strict';

const log = require('kiat-log');
const browser = require('../../utils/browser');
const loader = require('../loader');
const formatter = require('../../utils/formatter');

const identity = () => {
    log.info('You should add callback');
};
let gCallback = identity;
let currentId;
const MILLI_TIMEOUT = 200;
const SPACE_INDENT = 4;
const MILLI_SECOND = 1000;

const ctx = loader.getCtx();

const stopListening = () => {
    gCallback = identity;
    if (currentId) {
        clearTimeout(currentId);
        currentId = undefined;
    }
};
const handleDeltaEvents = msg => {
    let payload;
    const delta = msg.delta;
    switch (delta.class) {
        case 'NewMessage':
            return formatter.deltaMessage(delta);
        case 'ClientPayload':
            payload = formatter.clientPayload(delta.payload);
            if (payload && payload.deltas) {
                return payload.deltas.filter(delta => delta.deltaMessageReaction)
                    .map(msgRea => formatter.reaction(msgRea, msg.ofd_ts));
            }
            return;
        case 'MarkRead':
            return formatter.markRead(delta);
        case 'AdminTextMessage':
            return formatter.adminTextMessage(delta.messageMetadata);
        case 'ReadReceipt':
            return {
                reader: delta.actorFbId,
                time: delta.actionTimestampMs,
                threadId: delta.threadKey.threadFbId || delta.threadKey.otherUserFbId,
                type: 'read_receipt',
            };
        case 'DeliveryReceipt':
            return {
                reader: delta.actorFbId,
                time: delta.deliveredWatermarkTimestampMs,
                threadId: delta.threadKey.threadFbId || delta.threadKey.otherUserFbId,
                type: 'delivery_receipt',
            };
        default:
            log.warn(`${delta.class} is not has case`);
            log.warn(JSON.stringify(msg, null, SPACE_INDENT));
    }
};

const handleMessagingEvents = msg => {

    switch (msg.event) {
        case 'read_receipt':
            return formatter.readReceipt(msg);

        // 'read event' triggers when the user read other people's messages.
        case 'read':
            return formatter.read(msg);
        default:
            return false;
    }
};

const handlePresence = (buddyList, fmt) => {
    const fmtMsgs = [];
    for (const userId in buddyList) {
        if (buddyList.hasOwnProperty(userId)) {
            const fmtMsg = fmt(buddyList[userId], userId);
            if (fmtMsg) {
                fmtMsgs.push(fmtMsg);
            }
        }
    }
    return fmtMsgs;
};
const handleAction = msg => {
    switch (msg.type) {
        case 'typ':
        case 'ttyp':
            return formatter.typing(msg, ctx.userId);
        case 'chatproxy-presence':
            return handlePresence(msg.buddyList, formatter.proxyPresence);
        case 'buddylist_overlay':
            return handlePresence(msg.buddyList, formatter.presence);
        case 'delta':
            return handleDeltaEvents(msg);
        case 'message':
            return handleMessagingEvents(msg);
        case 'inbox':

            // Don't need create handle for it
            break;
        case 'jewel_requests_add':
            return {
                threadId: msg.from,
                type: 'requests_add',
            };
        case 'jewel_requests_remove_old':
            return {
                threadId: msg.from,
                type: 'requests_remove',
            };
        default:
            log.warn(`don't have handle for ${msg.type}`);
            log.warn(JSON.stringify(msg));
    }
};

let prev = Date.now();
let tmpPrev = Date.now();
let lastSync = ~~(Date.now() / MILLI_SECOND);

let msgsRecv = 0;
const form = browser.formPull(ctx, msgsRecv);
const fullReload = () => {
    delete form.sticky_pool;
    delete form.sticky_token;

    // currentId = undefined;
    loader.get('https://www.facebook.com/notifications/sync/', {lastSync})
        .then(() => {
            lastSync = ~~(Date.now() / MILLI_SECOND);
            const formAll = {
                client: 'mercury',
                folder: ['inbox'],
                last_action_timestamp: ~~Date.now(),
            };
            loader.post('https://www.facebook.com/ajax/mercury/thread_sync.php', formAll)
                .then(() => {
                    currentId = setTimeout(invoke, MILLI_TIMEOUT);
                });
        });
};

const litenErr = err => {
    if (err.code === 'ETIMEDOUT') {
        log.info('listen', 'Suppressed timeout error.');
    } else if (err.code === 'EAI_AGAIN') {
        browser.changeServer();
    } else {
        log.error('listen', err);
        gCallback(err);
    }
};

const invoke = () => {

    form.idle = ~~(Date.now() / MILLI_SECOND) - prev;
    prev = ~~(Date.now() / MILLI_SECOND);
    loader.getPull(form)
        .then(body => {
            const now = Date.now();
            log.verbose('listen', `Got answer in ${now - tmpPrev}`);
            tmpPrev = now;

            // log.info('body', JSON.stringify(body, null, SPACE_INDENT));
            form.seq = body.seq || form.seq;
            form.traceid = body.tr || form.traceid;
            switch (body.t) {
                case 'lb':
                    form.sticky_token = body.lb_info.sticky;
                    form.sticky_pool = body.lb_info.pool;
                    break;
                case 'fullReload':
                    return fullReload();
                default:
                    log.verbose(body.t);
            }

            const ms = (body.ms || []).sort((a, b) => a.timestamp - b.timestamp);
            msgsRecv += ms.length;
            for (const msg of ms) {

                let fmtMsg = handleAction(msg);
                if (!Array.isArray(fmtMsg)) {
                    fmtMsg = [fmtMsg];
                }
                for (const msg of fmtMsg) {
                    msg && gCallback(null, msg);
                }
            }
        })
        .catch(litenErr)
        .finally(() => currentId && (currentId = setTimeout(invoke, MILLI_TIMEOUT)));
};

module.exports = (callback = identity) => {
    gCallback = callback;
    if (!currentId) {
        currentId = setTimeout(invoke, MILLI_TIMEOUT);
    }

    return stopListening;
};
