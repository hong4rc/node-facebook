import Api, { Id } from '../src/api';
import {
  pMe, pFriend,
  becomeFriend,
} from './user';

let me: Api;
let friend: Api;
let groupId: Id;

describe('Message', () => {
  beforeAll(async () => {
    me = await pMe;
    friend = await pFriend;

    await becomeFriend(me, friend);
  });

  test('create group', async () => {
    groupId = (await me.createGroup({
      name: 'test group',
      message: 'No message',
      pin: false,
      privacy: 'secret',
    }, friend.id)).id;
  });

  test('leave group', () => Promise.all([me.leaveGroup(groupId), friend.leaveGroup(groupId)]));
});
