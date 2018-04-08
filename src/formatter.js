let formatID = (id) => {
    if (id) {
        return id.replace(/(fb)?id[:.]/, '');
    } else {
        return id;
    }
};
module.exports = {
    proxyPresence: (presence, userID) => {
        if (presence.lat === undefined || presence.p === undefined) return null;
        return {
            type: "presence",
            timestamp: presence.lat * 1000,
            userID: userID,
            statUser: presence.p
        };
    },
    presence: (presence, userID) => {
        return {
            type: "presence",
            timestamp: presence.la * 1000,
            userID: userID,
            statUser: presence.a
        };
    },
    deltaMessage: msg => {
        console.log(msg);
        let metaData = msg.delta.messageMetadata;

        return {
            type: "message",
            senderID: formatID(metaData.actorFbId.toString()),
            body: msg.delta.body || "",
            threadID: formatID(
                (metaData.threadKey.threadFbId || metaData.threadKey.otherUserFbId).toString()
            ),
            messageID: metaData.messageId,
            attachments: (msg.delta.attachments || []).map(v => _formatAttachment(v)),
            timestamp: metaData.timestamp,
            isGroup: !!metaData.threadKey.threadFbId
        };
    }
};