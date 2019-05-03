import { createReadStream } from 'fs';
import { join } from 'path';
import Api from '../src/api';
import {
  pMe, pFriend,
  init, final, each, clear,
} from './user';

let me: Api;
let friend: Api;

describe('Message', () => {
  beforeAll(async () => {
    me = await pMe;
    friend = await pFriend;

    await init(me, friend);
  });

  afterAll(() => final(me));

  afterEach(() => {
    each(me, friend);
  });

  test('body', (done) => {
    const text = 'HelLo, Friend!';
    me.once('msg', (message) => {
      expect(message).toHaveProperty('body', text);
      done();
    });
    friend.sendMessage({
      body: text,
    }, me.id);
  });

  test('url', (done) => {
    const data = {
      url: 'https://github.com/Hongarc/node-facebook',
      title: 'Hongarc/node-facebook',
    };
    me.once('msg', (message) => {
      expect(message).toMatchObject({
        attachments: [{
          title: data.title,
        }],
      });
      done();
    });
    friend.sendMessage({
      url: data.url,
    }, me.id);
  });

  test('sticker', (done) => {
    const data = {
      sticker: '907260072679123',
      body: 'This is sticker',
    };
    me.once('msg', (message) => {
      expect(message).toMatchObject({
        body: data.body,
        attachments: [{
          id: data.sticker,
        }],
      });
      done();
    });
    friend.sendMessage(data, me.id);
  });

  test('mentions', (done) => {
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
      expect(message).toMatchObject({
        body: data.body,
        mentions: {}, // todo convert to input
      });
      done();
    });
    friend.sendMessage(data, me.id);
  });

  test('attachments', (done) => {
    const filename = 'package.json';
    const data = {
      body: 'This is one file',
      attachments: [createReadStream(join(process.cwd(), filename))],
    };
    me.once('msg', (message) => {
      expect(message).toMatchObject({
        body: data.body,
        attachments: [{
          filename,
        }],
      });
      done();
    });
    friend.sendMessage(data, me.id);
  });

  test('ware', (done) => {
    const data = {
      body: 'This is a ware',
      ware: true,
    };
    me.once('msg', (message) => {
      expect(message).toMatchObject({
        body: data.body,
        attachments: [{
          type: 'ware',
        }],
      });
      done();
    });
    friend.sendMessage(data, me.id);
  });

  test('emoji', (done) => {
    const emoji = '🚀';
    me.once('log_admin', (data) => {
      expect(data).toMatchObject({
        type: 'change_thread_icon',
        untypedData: {
          threadIcon: emoji,
        },
      });
      done();
    });
    friend.changeEmoji(me.id, emoji);
  });

  test('nickname', (done) => {
    const nickname = 'your nickname';
    me.once('log_admin', (data) => {
      expect(data).toMatchObject({
        type: 'change_thread_nickname',
        untypedData: {
          nickname,
        },
      });
      done();
    });
    friend.changeNickname(nickname, me.id);
  });

  test('mark as read', (done) => {
    me.once('read_receipt', (data) => {
      expect(data).toMatchObject({
        reader: friend.id,
      });
      done();
    });
    friend.markAsRead(me.id);
  });

  test('react message', async (done) => {
    // TODO load from type and random reaction
    const react = {
      name: 'haha',
      icon: '😆',
    };
    const { messageId } = await me.sendMessage({ body: 'hi' }, friend.id);

    me.once('reaction', (data) => {
      expect(data).toMatchObject({
        messageId,
        reaction: react.icon,
      });
      done();
    });
    friend.reactMessage(messageId, react.name);
  });

  test('react message with wrong name', async () => {
    const { messageId } = await me.sendMessage({ body: 'hi' }, friend.id);
    const wrongName = 'something';
    await expect(friend.reactMessage(messageId, wrongName)).rejects.toMatchObject({
      message: `'We don't support ${wrongName} now, create issue if Fb use this reaction`,
    });
  });

  test('delete message', (done) => {
    me.sendMessage({ body: 'hi' }, friend.id)
      .then(({ messageId }) => {
        me.once('del_msg', (data) => {
          expect(data).toMatchObject({
            threadId: friend.id,
            messageIds: [
              messageId,
            ],
          });
          clear();
          done();
        });

        me.deleteMessage(messageId);
      }, () => done.fail());
  });

  test('unsend message', async () => {
    const { messageId } = await me.sendMessage({ body: 'hi' }, friend.id);
    await me.unsendMessage(messageId);
    clear();
  });

  test('get thread list', async () => {
    const threadList = await me.getThreadList(20, Date.now());
    expect(threadList).toBeInstanceOf(Array);
  });

  test('get thread message', async () => {
    const threadMessages = await me.getThreadMessages(friend.id);
    expect(threadMessages).toBeInstanceOf(Array);
  });
});
