import { ReadStream } from 'fs';

import Api, { Form, Id } from '../api';

export interface Mentions {
  id: Id;
  offset: number;
  length: number;
}

export interface Message {
  attachments?: ReadStream[];
  url?: string;
  sticker?: Id;
  body?: string;
  mentions?: Mentions[];
  ware?: boolean;
}

export default async function (this: Api, message: Message, threadId: Id): Promise<Form> {
  const oti = Api.genOTI();
  const form: Form = {
    action_type: 'ma-type:user-generated-message',
    timestamp: Date.now(),
    source: 'source:titan:web',
    body: message.body ? message.body.toString() : '',
    offline_threading_id: oti,
    message_id: oti,
    has_attachment: Boolean(message.attachments || message.url || message.sticker),
  };

  if (message.sticker) {
    form.sticker_id = message.sticker;
  }

  if (message.ware) {
    form.lightweight_action_attachment = {
      lwa_state: 'INITIATED',
      lwa_type: 'WAVE',
    };
  }

  if (message.attachments) {
    const files = await Promise.all(message.attachments.map(file => this.uploadFile(file)));
    files.forEach((file: Form) => {
      const type = Object.keys(file)[0];
      const types = `${type}s`;
      if (!form[types]) {
        form[types] = [];
      }
      (form[types] as Id[]).push(file[type]);
    });
  }

  if (message.url) {
    form.shareable_attachment = await this.shareUrl(message.url);
  }

  if (message.mentions) {
    form.profile_xmd = message.mentions.map((mention: Mentions) => Object.assign(mention, { type: 'p' }));
  }

  const profiles = await this.getUserInfo(threadId);
  if (Object.keys(profiles).length > 0) {
    form.specific_to_list = [`fbid:${threadId}`, `fbid:${this.getMyId()}`];
    form.other_user_fbid = threadId;
  } else {
    form.thread_fbid = threadId;
  }

  return this.send(form);
}
