'use strict';

const loader = require('../loader');
const upLoadFile = require('./api/upLoadFile');
const shareUrl = require('./api/shareUrl');
const send = require('./api/send');

const FIRST = 0;

module.exports = {
    attachments: (msg, form) => {
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
            files.push(loader.loadApi(upLoadFile)(attachment));
        }
        return Promise.all(files)
            .then(files => {
                files.forEach(file => {
                    const key = Object.keys(file);
                    const type = key[FIRST];
                    form[`${type}s`].push(file[type]);
                });
            });
    },
    url: (msg, form) => {
        if (!msg.url) {
            return;
        }

        form.shareable_attachment = {share_type: 100};
        return loader.loadApi(shareUrl)(msg.url)
            .then(shareParams => {
                form.shareable_attachment.share_params = shareParams;
            });
    },
    mention: (msg, form) => {
        if (!msg.mentions) {
            return;
        }
        form.profile_xmd = [];
        for (const mention of msg.mentions) {
            const tag = mention.tag;
            const offset = msg.body.indexOf(tag, mention.index || FIRST);
            const id = mention.id || FIRST;
            const length = tag.length;
            form.profile_xmd.push({offset, length, id, type: 'p'});
        }
    },
    send: (form, threadId) => loader.getApi().getUserInfo(threadId)
        .then(res => {
            if (Object.keys(res).length) {
                form.specific_to_list = [`fbid:${threadId}`, `fbid:${loader.getCtx().userId}`];
                form.other_user_fbid = threadId;
            } else {
                form.thread_fbid = threadId;
            }
            return loader.loadApi(send)(form, threadId);
        })
};
