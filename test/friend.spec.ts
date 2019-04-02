import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import Facebook from '../src/Facebook';
import Api, { Form, Id } from '../src/Api';

interface UInfo {
  email: string;
  pass: string;
  state: Form[];
}
interface UInfos {
  me: UInfo;
  friend: UInfo;
}
const infoPath = join(__dirname, 'info.json');
const info: UInfos = JSON.parse(process.env.CI ? process.env.INFO as string : readFileSync(infoPath, 'utf8'));

const me = new Facebook({ state: info.me.state });
const friend = new Facebook({ state: info.friend.state });

describe('Friend', async function () {
  this.timeout(40000);

  let aMe: Api;
  let aFriend: Api;
  let iFriend: Id;
  let users: Form;
  let isFriend: boolean = true;

  before(async () => {
    aMe = await me.login();
    aFriend = await friend.login();
    iFriend = aFriend.id;
    users = await aMe.getUserInfo(iFriend);
    isFriend = users[aFriend.id].is_friend;
  });

  describe('Trust action', () => {
    const removeFriend = () => it('remove friend when is friend', async () => {
      await aMe.removeFriend(iFriend);
    });

    if (isFriend) {
      removeFriend();
    }

    it('request friend when isn\'t friend', async () => {
      await aMe.cancelFriend(iFriend);
      const res = await aMe.addFriend(iFriend);
      expect(res.payload).have.property('success', true);
    });

    it('accept friend when has request', async () => {
      const res = await aFriend.acceptFriend(aMe.id);
      expect(res.payload).have.property('success', true);
    });

    if (!isFriend) {
      removeFriend();
    }
  })
});
