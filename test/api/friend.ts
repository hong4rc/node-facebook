import { expect } from 'chai';
import Api from '../../src/Api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;
  before('Become stranger and request', async () => {
    me = await pMe;
    friend = await pFriend;
    await me.cancelFriend(friend.id);
    await friend.cancelFriend(me.id);
    await me.removeFriend(friend.id);
    await me.addFriend(friend.id);
  });

  it('api.cancelFriend', async () => {
    const res = await me.cancelFriend(friend.id);
    expect(res).have.not.property('error');
  });

  it('api.addFriend', async () => {
    const res = await me.addFriend(friend.id);
    expect(res).have.property('payload').that.have.property('success', true);
  });

  it('api.acceptFriend', async () => {
    const res = await friend.acceptFriend(me.id);
    expect(res).have.property('payload').that.have.property('success', true);
  });

  it('api.removeFriend', async () => {
    await friend.removeFriend(me.id);
    const users = await friend.getUserInfo(me.id);
    expect(users).have.property(me.id).that.have.property('isFriend', false);
  });
};
