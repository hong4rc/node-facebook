import { expect } from 'chai';
import Api from '../../src/api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;
  before('Become stranger and request', async () => {
    me = await pMe;
    friend = await pFriend;
    const ignore = () => {};
    await me.cancelFriend(friend.id).then(ignore, ignore);
    await friend.cancelFriend(me.id).then(ignore, ignore);
    await me.removeFriend(friend.id).then(ignore, ignore);
    await me.addFriend(friend.id).then(ignore, ignore);
  });

  it('api.cancelFriend', async () => {
    const response = await me.cancelFriend(friend.id);
    expect(response).have.not.property('error');
  });

  it('api.addFriend', async () => {
    const response = await me.addFriend(friend.id);
    expect(response).have.property('payload').that.have.property('success', true);
  });

  it('api.acceptFriend', async () => {
    const response = await friend.acceptFriend(me.id);
    expect(response).have.property('payload').that.have.property('success', true);
  });

  it('api.removeFriend', async () => {
    await friend.removeFriend(me.id);
    const users = await friend.getUserInfo(me.id);
    expect(users).have.property(me.id).that.have.property('isFriend', false);
  });
};
