'use strict';

const browser = require('../utils/browser');
const log = require('../utils/log');
const FIRST = 0;

module.exports = (defFunc, api, ctx) => {

    const handleAttachment = (msg, form) => {
        if (!msg.attachments) {
            return;
        }
        form.image_ids = [];
        form.gif_ids = [];
        form.file_ids = [];
        form.video_ids = [];
        form.audio_ids = [];

        const files = [];
        for (const attachment of msg.attachments) {
            const formAtt = {
                upload_1024: attachment,
                voice_clip: 'true'
            };
            files.push(
                defFunc.postFormData('https://upload.facebook.com/ajax/mercury/upload.php', ctx.jar, formAtt, {})
                    .then(browser.parseAndCheckLogin(ctx, defFunc))
                    .then(res => res.payload.metadata[FIRST]));
        }
        return Promise.all(files)
            .then(files => {
                files.forEach(file => {
                    const key = Object.keys(file);
                    const type = key[FIRST];
                    form[`${type}s`].push(file[type]);
                });
            });
    };
    const handleUrl = (msg, form) => {
        if (!msg.url) {
            return;
        }

        form['shareable_attachment[share_type]'] = '100';
        const formUrl = {
            image_height: 960,
            image_width: 960,
            uri: msg.url
        };

        return defFunc.post('https://www.facebook.com/message_share_attachment/fromURI/', ctx.jar, formUrl)
            .then(browser.parseAndCheckLogin(ctx, defFunc))
            .then(res => {
                form['shareable_attachment[share_params]'] = res.payload.share_data.share_params;
            });
    };

    const handleMention = (msg, form) => {
        if (!msg.mentions) {
            return;
        }
        form.profile_xmd = [];
        for (const mention of msg.mentions) {
            const tag = mention.tag;
            const offset = msg.body.indexOf(tag, mention.index || FIRST);

            if (offset < FIRST) {
                log.warn('handleMention', `Mention for "${tag}" not found in message string.`);
            }

            if (mention.id === null) {
                log.warn('handleMention', 'Mention id should be non-null.');
            }
            const id = mention.id || FIRST;
            const length = tag.length;
            form.profile_xmd.push({offset, length, id, type: 'p'});
        }
    };
    const sendMsg = (msg, form, threadId) => {
        form.specific_to_list = [`fbid:${threadId}`, `fbid:${ctx.userId}`];
        form.other_user_fbid = threadId;

        log.info('form', form);
        return defFunc
            .post('https://www.facebook.com/messaging/send/', ctx.jar, form)
            .then(browser.parseAndCheckLogin(ctx, defFunc));
    };

    return (msg, threadId) => {
        if (typeof msg === 'string') {
            msg = {body: msg};
        }
        const messageAndOTId = browser.generateOfflineThreadingId();
        const form = {
            client: 'mercury',
            action_type: 'ma-type:user-generated-message',
            timestamp: Date.now(),
            source: 'source:chat:web',
            body: msg.body ? msg.body.toString() : '',
            ui_push_phase: 'C3',
            offline_threading_id: messageAndOTId,
            message_id: messageAndOTId,
            has_attachment: Boolean(msg.attachment || msg.url || msg.sticker)
        };

        if (msg.sticker) {
            form.sticker_id = msg.sticker;
        }
        new Promise(resolve => resolve())
            .then(() => handleAttachment(msg, form))
            .then(() => handleUrl(msg, form))
            .then(() => handleMention(msg, form))
            .then(() => sendMsg(msg, form, threadId))
            .catch(error => {
                log.error(error);
            });
    };

};
