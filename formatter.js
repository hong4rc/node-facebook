'use strict';
let formatId = (id) => {
    if (id) {
        return id.replace(/(fb)?id[:.]/, '');
    } else {
        return id;
    }
};
module.exports = {
    proxyPresence: (presence, userId) => {
        if (presence.lat === undefined || presence.p === undefined) return null;
        return {
            type: 'presence',
            timestamp: presence.lat * 1000,
            userId: userId,
            statUser: presence.p
        };
    },
    presence: (presence, userId) => {
        return {
            type: 'presence',
            timestamp: presence.la * 1000,
            userId: userId,
            statUser: presence.a
        };
    },
    deltaMessage: delta => {
        console.log(JSON.stringify(msg, null, 4));
        let metaData = delta.messageMetadata;

        let mData = delta.data && delta.data.prng && JSON.parse(delta.data.prng);
        let mentions = {};
        for (let data of mData) {
            mentions[data.i] = delta.body.substring(data.o, data.o + data.l);
        }
        return {
            type: 'message',
            senderId: formatId(metaData.actorFbId.toString()),
            body: msg.delta.body || '',
            threadId: formatId((metaData.threadKey.threadFbId || metaData.threadKey.otherUserFbId).toString()),
            messageId: metaData.messageId,
            timestamp: metaData.timestamp,
            isGroup: !!metaData.threadKey.threadFbId,
            mentions,
        };
    },

    readReceipt: event => {
        return {
            reader: event.reader.toString(),
            time: event.time,
            threadId: formatId((event.thread_fbid || event.reader).toString()),
            type: 'read_receipt'
        };
    },

    read: event => {
        return {
            threadId: formatId(((event.chat_ids && event.chat_ids[0]) || (event.thread_fbids && event.thread_fbids[0])).toString()),
            time: event.timestamp,
            type: 'read'
        };
    },
    clientPayload: payload => {
        return JSON.parse(String.fromCharCode.apply(null, payload));
    }
};