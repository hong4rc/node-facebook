'use strict';

const utils = require('../utils');

module.exports = (defFunc, api, ctx) => {

    let uploadAttachments = (attachments) => {
        //TODO send attachments
    };
    let handleAttachment = (msg, form) => {
        if (msg.attachments) {
            if (!Array.isArray(msg.attachments)) {
                msg.attachments = [msg.attachments];
            }
            // uploadAttachment(msg.attachment);
        }
        return uploadAttachments(msg.attachments)
    };
    let handleUrl = (msg, form) => {
        if (!msg.url) {
            return;
        }

        form['shareable_attachment[share_type]'] = '100';
        let formUrl = {
            image_height: 960,
            image_width: 960,
            uri: msg.url
        };

        return defFunc.post('https://www.facebook.com/message_share_attachment/fromURI/', ctx.jar, formUrl)
            .then(utils.parseAndCheckLogin(ctx, defFunc))
            .then(res => {
                form['shareable_attachment[share_params]'] = res.payload.share_data.share_params;
            });
    };

    let handleMention = (msg, form) => {
        if (!msg.mentions) {
            return;
        }
        form['profile_xmd'] = [];
        for (let mention of msg.mentions) {
            let tag = mention.tag;
            let offset = msg.body.indexOf(tag, mention.index || 0);

            if (offset < 0) {
                console.log('warn', 'handleMention', 'Mention for "' + tag + '" not found in message string.');
            }

            if (mention.id === null) {
                console.log('warn', 'handleMention', 'Mention id should be non-null.');
            }
            let id = mention.id || 0;
            let length = tag.length;
            form['profile_xmd'].push({offset, length, id, type: 'p'});
        }
    };
    let sendMsg = (msg, form, threadID) => {
        form['specific_to_list'] = ['fbid:' + threadID, 'fbid:' + ctx.userID];
        form['other_user_fbid'] = threadID;

        console.log('form', form);
        return defFunc
            .post('https://www.facebook.com/messaging/send/', ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defFunc))
    };

    return (msg, threadID) => {
        let messageAndOTID = utils.generateOfflineThreadingID();
        let form = {
            client: 'mercury',
            action_type: 'ma-type:user-generated-message',
            timestamp: Date.now(),
            source: 'source:chat:web',
            body: msg.body ? msg.body.toString() : '',
            ui_push_phase: 'C3',
            offline_threading_id: messageAndOTID,
            message_id: messageAndOTID,
            has_attachment: !!(msg.attachment || msg.url || msg.sticker)
        };

        if (msg.sticker) {
            form['sticker_id'] = msg.sticker;
        }
        let msgPromise = new Promise(resolve => resolve());
        msgPromise = msgPromise
            .then(() => handleAttachment(msg, form))
            .then(() => handleUrl(msg, form))
            .then(() => handleMention(msg, form))
            .then(() => sendMsg(msg, form, threadID));
        //Send


    }

};
