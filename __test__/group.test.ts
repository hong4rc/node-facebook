import Api, { Id } from '../src/api';
import {
  pMe, pFriend,
  becomeFriend,
} from './user';
import { validOption } from '../src/propApi/create-group';

let me: Api;
let friend: Api;
let groupId: Id;

describe('Message', () => {
  beforeAll(async () => {
    me = await pMe;
    friend = await pFriend;

    await becomeFriend(me, friend);
  });

  test('valid option', async () => {
    const name = 'valid option';
    const privacy = 'open';

    expect(validOption({ name, privacy, pin: true }))
      .toMatchObject({ name, privacy, add_to_favorites: 'on' });

    // @ts-ignore
    expect(validOption({ name, pin: false }))
      .toMatchObject({ name, privacy: 'close' , add_to_favorites: undefined });
  });

  test('create group', async () => {
    groupId = (await me.createGroup({
      name: 'test group',
      message: 'No message',
      pin: false,
      privacy: 'secret',
    }, friend.id)).id;
  });

  test('remove member', () => me.removeMember(groupId, friend.id, [0, 1, 2, 3, 4]));

  test('leave group', () => Promise.all([me.leaveGroup(groupId), friend.leaveGroup(groupId)]));
});
