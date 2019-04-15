import { expect } from 'chai';
import { createReadStream } from 'fs';
import { join } from 'path';
import Api, { Id, Form } from '../../src/Api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;
  let msgId: Id;
  let listener: ((...args: Form[]) => void) | undefined;
  const hookMsgId = (msg: Form) => {
    msgId = msg.messageId || '';
  };
  before('Become friend', async () => {
    me = await pMe;
    friend = await pFriend;

    await friend.addFriend(me.id);
    await me.acceptFriend(friend.id);
    me.listen();
    me.on('msg', hookMsgId);
  });

  after(() => {
    me.on('off', hookMsgId);
    me.stopListen();
  });


  afterEach(() => {
    if (listener) {
      me.removeListener('msg', listener);
      listener = undefined;
    }
    if (msgId) {
      me.deleteMessage(msgId);
      friend.deleteMessage(msgId);
      msgId = '';
    }
  });

  it('body', (done) => {
    const text = 'HelLo, Friend!';
    listener = (msg) => {
      expect(msg).have.property('body', text);
      done();
    };
    me.on('msg', listener);
    friend.sendMsg({
      body: text,
    }, me.id);
  });

  it('url', (done) => {
    const data = {
      url: 'https://github.com/Hongarc/node-facebook',
      title: 'Hongarc/node-facebook',
    };
    listener = (msg) => {
      expect(msg).have.nested.property('attachments[0].title', data.title);
      done();
    };
    me.on('msg', listener);
    friend.sendMsg({
      url: data.url,
    }, me.id);
  });

  it('sticker', (done) => {
    const data = {
      sticker: '907260072679123',
      body: 'This is sticker',
    };
    listener = (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.nested.property('attachments[0].id', data.sticker);
      done();
    };
    me.on('msg', listener);
    friend.sendMsg(data, me.id);
  });

  it('mentions', (done) => {
    const data = {
      mentions: [{
        id: friend.id,
        offset: 0,
        length: 3,
      }, {
        id: me.id,
        offset: 8,
        length: 7,
      }],
      body: 'You are Hongarc\'s friend',
    };
    listener = (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.property('mentions').that.have.all.keys(me.id, friend.id);
      done();
    };
    me.on('msg', listener);
    friend.sendMsg(data, me.id);
  });

  it('attachments', (done) => {
    const filename = 'package.json';
    const data = {
      body: 'This is one file',
      attachments: [createReadStream(join(process.cwd(), filename))],
    };
    listener = (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.nested.property('attachments[0].filename', filename);
      done();
    };
    me.on('msg', listener);
    friend.sendMsg(data, me.id);
  });

  it('ware', (done) => {
    const data = {
      body: 'This is a ware',
      ware: true,
    };
    listener = (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.nested.property('attachments[0].type', 'ware');
      done();
    };
    me.on('msg', listener);
    friend.sendMsg(data, me.id);
  });
};
