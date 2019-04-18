import { expect } from 'chai';
import { createReadStream } from 'fs';
import { join } from 'path';
import Api, { Id, Form } from '../../src/api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;
  let messageIdHook: Id;
  const hookMessageId = (message: Form) => {
    messageIdHook = message.messageId || '';
  };
  before('Become friend', async () => {
    me = await pMe;
    friend = await pFriend;
    const ignore = () => {};
    await friend.addFriend(me.id).then(ignore, ignore);
    await me.acceptFriend(friend.id).then(ignore, ignore);
    await friend.changeEmoji(me.id, '💖').then(ignore, ignore);

    me.listen();
    me.on('msg', hookMessageId);
  });

  after(() => {
    me.once('off', hookMessageId);
    me.stopListen();
  });

  afterEach(() => {
    if (messageIdHook) {
      me.deleteMessage(messageIdHook);
      friend.deleteMessage(messageIdHook);
      messageIdHook = '';
    }
  });

  it('body', (done) => {
    const text = 'HelLo, Friend!';
    me.once('msg', (message) => {
      expect(message).have.property('body', text);
      done();
    });
    friend.sendMessage({
      body: text,
    }, me.id);
  });

  it('url', (done) => {
    const data = {
      url: 'https://github.com/Hongarc/node-facebook',
      title: 'Hongarc/node-facebook',
    };
    me.once('msg', (message) => {
      expect(message).have.nested.property('attachments[0].title', data.title);
      done();
    });
    friend.sendMessage({
      url: data.url,
    }, me.id);
  });

  it('sticker', (done) => {
    const data = {
      sticker: '907260072679123',
      body: 'This is sticker',
    };
    me.once('msg', (message) => {
      expect(message).have.property('body', data.body);
      expect(message).have.nested.property('attachments[0].id', data.sticker);
      done();
    });
    friend.sendMessage(data, me.id);
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
    me.once('msg', (message) => {
      expect(message).have.property('body', data.body);
      expect(message).have.property('mentions').that.have.all.keys(me.id, friend.id);
      done();
    });
    friend.sendMessage(data, me.id);
  });

  it('attachments', (done) => {
    const filename = 'package.json';
    const data = {
      body: 'This is one file',
      attachments: [createReadStream(join(process.cwd(), filename))],
    };
    me.once('msg', (message) => {
      expect(message).have.property('body', data.body);
      expect(message).have.nested.property('attachments[0].filename', filename);
      done();
    });
    friend.sendMessage(data, me.id);
  });

  it('ware', (done) => {
    const data = {
      body: 'This is a ware',
      ware: true,
    };
    me.once('msg', (message) => {
      expect(message).have.property('body', data.body);
      expect(message).have.nested.property('attachments[0].type', 'ware');
      done();
    });
    friend.sendMessage(data, me.id);
  });

  it('Emoji', (done) => {
    const emoji = '🚀';
    me.once('log_admin', (data) => {
      expect(data).have.property('type', 'change_thread_icon');
      expect(data).have.nested.property('untypedData.threadIcon', emoji);
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

  it('Mark as read', (done) => {
    me.once('read_receipt', (data) => {
      expect(data).have.property('reader', friend.id);
      done();
    });
    friend.markAsRead(me.id);
  });

  it('react message', (done) => {
    // TODO load from type and random reaction
    const react = {
      name: 'haha',
      icon: '😆',
    };
    me.sendMessage({ body: 'hi' }, friend.id)
      .then(({ messageId }) => {
        const wrongName = 'something';
        friend.reactMessage(messageId, wrongName).then(() => {
          expect.fail();
        }, (error: Error) => {
          expect(error).have.property('message', `'We don't support ${wrongName} now, create issue if Fb use this reaction`);
        });

        me.on('reaction', (data) => {
          expect(data).have.property('messageId', messageId);
          expect(data).have.property('reaction', react.icon);
          done();
        });
        friend.reactMessage(messageId, react.name);
      });
  });
};
