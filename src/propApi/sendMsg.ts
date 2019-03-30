import { ReadStream } from 'fs';

import Api, { Form, Id } from '../Api';

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
}

export default async function (this: Api, msg: Message, threadId: Id): Promise<Form> {
  const oti = Api.genOTI();
  const form: Form = {
    action_type: 'ma-type:user-generated-message',
    timestamp: Date.now(),
    source: 'source:titan:web',
    body: msg.body ? msg.body.toString() : '',
    offline_threading_id: oti,
    message_id: oti,
    has_attachment: Boolean(msg.attachments || msg.url || msg.sticker),
  };

  if (msg.sticker) {
    form.sticker_id = msg.sticker;
  }
  if (msg.attachments) {
    const files = await Promise.all(msg.attachments.map((file: ReadStream) => this.uploadFile(file)));
    files.forEach((file: Form) => {
      const type = Object.keys(file)[0];
      const types = type.replace(/Id$/, '_ids');
      if (!form[types]) {
        form[types] = [];
      }
      (form[types] as Id[]).push(file[type]);
    });
  }

  if (msg.url) {
    form.shareable_attachment = await this.shareUrl(msg.url);
  }

  if (msg.mentions) {
    form.profile_xmd = msg.mentions.map((mention: Mentions) => Object.assign(mention, { type: 'p' }));
  }

  const profiles = await this.getUserInfo(threadId);
  if (Object.keys(profiles).length) {
    form.specific_to_list = [`fbid:${threadId}`, `fbid:${this.getMyId()}`];
    form.other_user_fbid = threadId;
  } else {
    form.thread_fbid = threadId;
  }

  return this.send(form);
}
