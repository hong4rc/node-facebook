import { expect } from 'chai';
import { createReadStream } from 'fs';
import { join } from 'path';
import Api, { Id, Form } from '../../src/Api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;
  let msgId: Id;
  const hookMsgId = (msg: Form) => {
    msgId = msg.messageId || '';
  };
  before('Become friend', async () => {
    me = await pMe;
    friend = await pFriend;

    try {
      await friend.addFriend(me.id);
      await me.acceptFriend(friend.id);
      await friend.changeEmoji(me.id, '💖');
    } catch (error) {}

    me.listen();
    me.once('msg', hookMsgId);
  });

  after(() => {
    me.once('off', hookMsgId);
    me.stopListen();
  });

  afterEach(() => {
    if (msgId) {
      me.deleteMessage(msgId);
      friend.deleteMessage(msgId);
      msgId = '';
    }
  });

  it('body', (done) => {
    const text = 'HelLo, Friend!';
    me.once('msg', (msg) => {
      expect(msg).have.property('body', text);
      done();
    });
    friend.sendMsg({
      body: text,
    }, me.id);
  });

  it('url', (done) => {
    const data = {
      url: 'https://github.com/Hongarc/node-facebook',
      title: 'Hongarc/node-facebook',
    };
    me.once('msg', (msg) => {
      expect(msg).have.nested.property('attachments[0].title', data.title);
      done();
    });
    friend.sendMsg({
      url: data.url,
    }, me.id);
  });

  it('sticker', (done) => {
    const data = {
      sticker: '907260072679123',
      body: 'This is sticker',
    };
    me.once('msg', (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.nested.property('attachments[0].id', data.sticker);
      done();
    });
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
    me.once('msg', (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.property('mentions').that.have.all.keys(me.id, friend.id);
      done();
    });
    friend.sendMsg(data, me.id);
  });

  it('attachments', (done) => {
    const filename = 'package.json';
    const data = {
      body: 'This is one file',
      attachments: [createReadStream(join(process.cwd(), filename))],
    };
    me.once('msg', (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.nested.property('attachments[0].filename', filename);
      done();
    });
    friend.sendMsg(data, me.id);
  });

  it('ware', (done) => {
    const data = {
      body: 'This is a ware',
      ware: true,
    };
    me.once('msg', (msg) => {
      expect(msg).have.property('body', data.body);
      expect(msg).have.nested.property('attachments[0].type', 'ware');
      done();
    });
    friend.sendMsg(data, me.id);
  });

  it('Emoji', (done) => {
    const emoji = '🚀';
    me.once('inbox', () => {
      done();
    });
    friend.changeEmoji(me.id, emoji);
  });

  it('Nickname', (done) => {
    const nickname = 'your nickname';
    me.once('log_admin', (data) => {
      expect(data).have.property('type', 'change_thread_nickname');
      expect(data).have.nested.property('untypedData.nickname', nickname);
      done();
    });
    friend.changeNickname(nickname, me.id);
  });
};
