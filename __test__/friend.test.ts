import Api from '../src/api';
import {
  pMe, pFriend,
  cutOff,
} from './user';

let me: Api;
let friend: Api;

describe('Friend', () => {
  beforeAll(async () => {
    me = await pMe;
    friend = await pFriend;

    await cutOff(me, friend);
  });

  test('cancel request friend', async () => {
    const response = await me.cancelFriend(friend.id);
    expect(response).not.toHaveProperty('error');
  });

  test('add friend', async () => {
    const response = await me.addFriend(friend.id);
    expect(response).toHaveProperty('payload.success', true);
  });

  test(' accept friend', async () => {
    const response = await friend.acceptFriend(me.id);
    expect(response).toHaveProperty('payload.success', true);
  });

  test('remove friend', async () => {
    await friend.removeFriend(me.id);
    const users = await friend.getUserInfo(me.id);
    expect(users).toHaveProperty(`${me.id}.isFriend`, false);
  });
});
