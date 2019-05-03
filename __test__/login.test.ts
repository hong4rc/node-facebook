import Facebook from '../src/facebook';
import info from './info';

describe('Login', () => {
  describe('Use email/pass', () => {
    test('email match password', async () => {
      const me = new Facebook({
        email: info.me.email,
        pass: info.me.pass,
      });
      const api = await me.login();
      info.me.tmpState = api.getState();
      expect(typeof api.id).toBe('string');
    });

    test('email don\'t match password', async () => {
      const invalid = new Facebook({
        email: 'myemail@gmail.com',
        pass: 'wrong pass',
      });
      await expect(invalid.login()).rejects.toMatchObject({
        message: 'Wrong username/password.',
      });
    }, 20000);

    test('not fill pass', () => {
      // @ts-ignore
      expect(() => new Facebook({
        email: 'myemail@gmail.com',
      })).toThrowError('Please login with email/pass or cookie!');
    });

    test('not fill email', () => {
      // @ts-ignore
      expect(() => new Facebook({
        pass: 'my pass',
      })).toThrowError('Please login with email/pass or cookie!');
    });

    test('not fill email+pass', () => {
      // @ts-ignore
      expect(() => new Facebook({})).toThrowError('Please login with email/pass or cookie!');
    });

    test('fill wrong email+pass', () => {
      // @ts-ignore
      expect(() => new Facebook({
        email: '',
        pass: '',
      })).toThrowError('Please login with email/pass or cookie!');
    });

    test('blocked account', async () => {
      const blocked = new Facebook({
        email: info.blocked.email,
        pass: info.blocked.pass,
      });
      await expect(blocked.login()).rejects.toMatchObject({
        message: 'This account is blocked by Facebook !!!',
      });
    });
  });

  describe('Use state', () => {
    test('trust cookie', async () => {
      const friend = new Facebook({
        state: info.me.tmpState,
      });
      const api = await friend.login();
      info.me.tmpState = api.getState();
      expect(typeof api.id).toBe('string');
    });

    test('bad cookie', async () => {
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
      await expect(friend.login()).rejects.toMatchObject({
        message: 'Not found cookie with name c_user',
      });
    });
  });

  describe('Logout', () => {
    test('after login', async () => {
      const friend = new Facebook({
        state: info.me.tmpState,
      });
      const api = await friend.login();
      const headers = await api.logout();
      expect(headers.location).toMatch(/^https:\/\/www\.facebook\.com\/\?stype=lo/);
      info.me.tmpState = api.getState();
      expect(() => {
        api.browser.getCookie('c_user');
      }).toThrowError('Not found cookie with name c_user');
    });
  });
});
