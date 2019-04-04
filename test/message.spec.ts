import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import Facebook from '../src/Facebook';
import Api, { Form, Id } from '../src/Api';
import UInfos from './UInfos';

const infoPath = join(__dirname, 'info.json');
const info: UInfos = JSON.parse(process.env.CI ? process.env.INFO as string : readFileSync(infoPath, 'utf8'));

const fMe = new Facebook({ state: info.me.state });
const fFriend = new Facebook({ state: info.friend.state });

describe('Send and listen', async () => {
  let me: Api;
  let friend: Api;
  let iFriend: Id;
  let iMe: Id;
  let listener: (...args: Form[]) => void;

  before('Login + make friend', async () => {
    me = await fMe.login();
    friend = await fFriend.login();
    iFriend = friend.id;
    iMe = me.id;

    await friend.addFriend(iMe);
    await me.acceptFriend(iFriend);
  });

  beforeEach(() => {
    me.listen();
  });

  afterEach(() => {
    me.off('msg', listener);
    me.stopListen();
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
  });
});
