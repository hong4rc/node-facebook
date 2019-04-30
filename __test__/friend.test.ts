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

  test('api.cancelFriend', async () => {
    const response = await me.cancelFriend(friend.id);
    expect(response).not.toHaveProperty('error');
  });

  test('api.addFriend', async () => {
    const response = await me.addFriend(friend.id);
    expect(response).toHaveProperty('payload.success', true);
  });

  test('api.acceptFriend', async () => {
    const response = await friend.acceptFriend(me.id);
    expect(response).toHaveProperty('payload.success', true);
  });

  test('api.removeFriend', async () => {
    await friend.removeFriend(me.id);
    const users = await friend.getUserInfo(me.id);
    expect(users).toHaveProperty(`${me.id}.isFriend`, false);
  });
});
