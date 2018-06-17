'use strict';
const FIRST = 0;
const MILLIS = 1000;
const formatId = id => {
    id = id.toString();
    if (id) {
        return id.replace(/(fb)?id[:.]/, '');
    } else {
        return id;
    }
};

module.exports = {
    proxyPresence: (presence, userId) => {
        if (presence.lat === undefined || presence.p === undefined) {
            return null;
        }
        return {
            type: 'presence',
            timestamp: presence.lat * MILLIS,
            userId: userId,
            statUser: presence.p
        };
    },
    presence: (presence, userId) => ({
        type: 'presence',
        timestamp: presence.la * MILLIS,
        userId: userId,
        statUser: presence.a
    }),
    typing: (msg, userId) => {
        let threadId = msg.thread_fbid || msg.from;
        if (msg.to.toString() !== userId) {
            threadId = msg.to;
        }
        return {
            type: 'typ',
            isTyping: msg.st,
            fromMobile: !(msg.from_mobile === false),
            from: msg.from,
            threadId: threadId
        };
    },
    reaction: (msgRea, timestamp) => ({
        type: 'message_reaction',
        threadId: msgRea.threadKey.threadFbId || msgRea.threadKey.otherUserFbId,
        messageId: msgRea.messageId,
        reaction: msgRea.reaction,
        senderId: msgRea.senderId,
        userId: msgRea.userId,
        timestamp
    }),
    deltaMessage: delta => {
        const metaData = delta.messageMetadata;

        const mData = delta.data && delta.data.prng && JSON.parse(delta.data.prng) || [];
        const mentions = {};
        for (const data of mData) {
            mentions[data.i] = delta.body.substring(data.o, data.o + data.l);
        }
        return {
            type: 'message',
            senderId: formatId(metaData.actorFbId),
            body: delta.body || '',
            threadId: formatId(metaData.threadKey.threadFbId || metaData.threadKey.otherUserFbId),
            messageId: metaData.messageId,
            timestamp: metaData.timestamp,
            isGroup: Boolean(metaData.threadKey.threadFbId),
            mentions,
        };
    },

    readReceipt: event => ({
        reader: event.reader.toString(),
        time: event.time,
        threadId: formatId(event.thread_fbid || event.reader),
        type: 'read_receipt'
    }),

    read: event => {
        const id = event.chat_ids || event.thread_fbids;
        return {
            threadId: formatId(id[FIRST]),
            time: event.timestamp,
            type: 'read'
        };
    },
    clientPayload: payload => JSON.parse(String.fromCharCode.apply(null, payload)),
    markRead: delta => ({
        threadId: delta.threadKeys.otherUserFbId,
        time: delta.actionTimestamp,
        type: 'mark_read'
    }),
    formatProfiles: profiles => {
        const obj = {};

        for (const prop in profiles) {
            if (profiles.hasOwnProperty(prop)) {
                const profile = profiles[prop];
                obj[prop] = {
                    id: profile.id,
                    name: profile.name,
                    firstName: profile.firstName,
                    altName: profile.alternateName,
                    vanity: profile.vanity,
                    thumbSrc: profile.thumbSrc,
                    profileUrl: profile.uri,
                    gender: profile.gender,
                    type: profile.type,
                    isFriend: profile.is_friend,
                    isActive: profile.is_active,
                    isBirthday: Boolean(profile.is_birthday)
                };
            }
        }

        return obj;
    }
};
