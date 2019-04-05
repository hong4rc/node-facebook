import { expect } from 'chai';
import { createReadStream } from 'fs';
import { join } from 'path';
import Facebook from '../src/Facebook';
import Api, { Form, Id } from '../src/Api';
import info from './info';

const fMe = new Facebook({ state: info.me.state });
const fFriend = new Facebook({ state: info.friend.state });

describe('Send and listen', async () => {
  let me: Api;
  let friend: Api;
  let iFriend: Id;
  let iMe: Id;
  let listener: ((...args: Form[]) => void) | undefined;

  before('Login + make friend', async () => {
    me = await fMe.login();
    friend = await fFriend.login();
    iFriend = friend.id;
    iMe = me.id;

    await friend.addFriend(iMe);
    await me.acceptFriend(iFriend);
    me.listen();
  });

  after(() => {
    me.stopListen();
  });

  afterEach(() => {
    if (listener) {
      me.off('msg', listener);
      listener = undefined;
    }
  });

  describe('SendMsg', () => {
    it('body', (done) => {
      const text = 'HelLo, Friend!';
      listener = (msg) => {
        expect(msg).have.property('body', text);
        done();
      };
      me.on('msg', listener);
      friend.sendMsg({
        body: text,
      }, iMe);
    });

    it('url', (done) => {
      const data = {
        url: 'https://github.com/Hongarc/node-facebook',
        title: /Hongarc\/node-facebook/,
      };
      listener = (msg) => {
        // TODO change after format
        const att = JSON.stringify(msg.attachments);
        expect(att).that.match(data.title);
        done();
      };
      me.on('msg', listener);
      friend.sendMsg({
        url: data.url,
      }, iMe);
    });

    it('sticker', (done) => {
      const data = {
        sticker: '907260072679123',
        body: 'This is sticker',
      };
      listener = (msg) => {
        // TODO change after format
        expect(msg).have.property('body', data.body);
        expect(msg).have.deep.nested.property('attachments[0].mercury.stickerAttachment.id', data.sticker);
        done();
      };
      me.on('msg', listener);
      friend.sendMsg(data, iMe);
    });

    it('mentions', (done) => {
      const data = {
        mentions: [{
          id: iFriend,
          offset: 0,
          length: 3,
        }, {
          id: iMe,
          offset: 8,
          length: 7,
        }],
        body: 'You are Hongarc\'s friend',
      };
      listener = (msg) => {
        expect(msg).have.property('body', data.body);
        expect(msg).have.property('mentions');
        expect(msg.mentions).have.property(iMe);
        expect(msg.mentions).have.property(iFriend);
        done();
      };
      me.on('msg', listener);
      friend.sendMsg(data, iMe);
    });

    it('attachments', (done) => {
      const filename = 'package.json';
      const data = {
        body: 'This is one file',
        attachments: [createReadStream(join(__dirname, '../', filename))],
      };
      listener = (msg) => {
        // TODO change after format
        expect(msg).have.property('body', data.body);
        expect(msg).have.deep.nested.property('attachments[0].filename', filename);
        done();
      };
      me.on('msg', listener);
      friend.sendMsg(data, iMe);
    });
  });
});
