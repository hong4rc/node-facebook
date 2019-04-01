import { expect } from 'chai';

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Facebook from '../src/Facebook';

const infoPath = join(__dirname, 'info.json');
const info = JSON.parse(readFileSync(infoPath, 'utf8'));

describe('Login', () => {
  describe('Use email/pass', () => {
    it('Email match password', async () => {
      const friend = new Facebook({
        email: info.friend.email,
        pass: info.friend.pass,
      });
      const api = await friend.login();
      info.friend.state = api.getState();
      writeFileSync(infoPath, JSON.stringify(info, null, 2));
      expect(api.id).to.be.a('string');
    }).timeout(10000);

    it('Email don\'t match password', () => {
      const invalid = new Facebook({
        email: 'myemail@gmail.com',
        pass: 'wrong pass',
      });
      return invalid.login().then(() => {
        expect.fail();
      }, (error: Error) => {
        expect(error.message).to.equal('Wrong username/password.');
      });
    }).timeout(30000);

    it('Not fill pass', () => {
      // @ts-ignore
      expect(() => new Facebook({
        email: 'myemail@gmail.com',
      })).to.throw('Please login with email/pass or cookie!');
    });

    it('Not fill email', () => {
      // @ts-ignore
      expect(() => new Facebook({
        pass: 'my pass',
      })).to.throw('Please login with email/pass or cookie!');
    });

    it('Not fill email+pass', () => {
      // @ts-ignore
      expect(() => new Facebook({})).to.throw('Please login with email/pass or cookie!');
    });

    it('Fill wrong email+pass', () => {
      // @ts-ignore
      expect(() => new Facebook({
        email: '',
        pass: '',
      })).to.throw('Please login with email/pass or cookie!');
    });
  });

  describe('Use state', () => {
    it('Trust cookie', async () => {
      const friend = new Facebook({
        state: info.friend.state,
      });
      const api = await friend.login();
      info.friend.state = api.getState();
      writeFileSync(join(__dirname, 'info.json'), JSON.stringify(info, null, 2));
      expect(api.id).to.be.a('string');
    });

    it('Bad cookie', async () => {
      const friend = new Facebook({
        state: [{
          key: 'c_user',
          value: '100035062282969',
          expires: '2019-06-30T00:49:05.000Z',
          domain: 'facebook.com',
          path: '/',
          hostOnly: false,
          creation: '2019-03-31T17:49:28.041Z',
          lastAccessed: '2019-03-31T17:49:29.668Z',
        }],
      });
      try {
        await friend.login();
        expect.fail();
      } catch (error) {
        expect(error.message).to.equal('Not found cookie with name c_user');
      }
    });
  });
});