import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import Facebook from '../src/Facebook';
import Api, { Id } from '../src/Api';
import UInfos from './UInfos';

const infoPath = join(__dirname, 'info.json');
const info: UInfos = JSON.parse(process.env.CI ? process.env.INFO as string : readFileSync(infoPath, 'utf8'));

const fMe = new Facebook({ state: info.me.state });
const fFriend = new Facebook({ state: info.friend.state });

describe('Friend', async function () {
  this.timeout(40000);

  let me: Api;
  let friend: Api;
  let iFriend: Id;
  let iMe: Id;

  before('Login me and my friend', async () => {
    me = await fMe.login();
    friend = await fFriend.login();
    iFriend = friend.id;
    iMe = me.id;

    // Become stranger and request
    await me.cancelFriend(iFriend);
    await friend.cancelFriend(iMe);
    await me.removeFriend(iFriend);
    await me.addFriend(iFriend);
  });

  it('api.cancelFriend', async () => {
    const res = await me.cancelFriend(iFriend);
    expect(res).have.not.property('error');
  });

  it('api.addFriend', async () => {
    const res = await me.addFriend(iFriend);
    expect(res).have.property('payload').that.have.property('success', true);
  });

  it('api.acceptFriend', async () => {
    const res = await friend.acceptFriend(iMe);
    expect(res).have.property('payload').that.have.property('success', true);
  });

  it('api.removeFriend', async () => {
    await friend.removeFriend(iMe);
    const users = await friend.getUserInfo(iMe);
    expect(users).have.property(iMe).that.have.property('isFriend', false);
  });
});
