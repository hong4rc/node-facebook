
import Api, { Id } from '../src/api';
import {
  pMe, pFriend,
  init, final, each, ignore,
} from './user';

let me: Api;
let friend: Api;
let groupId: Id;

describe('Message group', () => {
  beforeAll(async () => {
    me = await pMe;
    friend = await pFriend;

    await init(me, friend);
  });

  afterAll(() => final(me));

  afterEach(() => {
    each(me, friend);
  });

  test('create message group', async () => {
    const name = 'My group';
    const response = await friend.createMsgGroup({
      name,
    }, me.id);
    groupId = response.threadId;
    expect(response).toHaveProperty('name', name);
  });

  test('delete participant', (done) => {
    friend.removeParticipant(groupId, me.id);
    me.once('log_admin', (data) => {
      expect(data).toMatchObject({
        type: 'ParticipantLeftGroupThread',
        leftId: me.id,
        threadId: groupId,
      });
      done();
    });
  });

  test('add user', (done) => {
    friend.addUserToThread(groupId, me.id);
    me.once('log_admin', (data) => {
      expect(data).toMatchObject({
        type: 'ParticipantsAddedToGroupThread',
        addedIds: [{ userFbId: me.id }],
        threadId: groupId,
      });
      done();
    });
  });

  test('send message', (done) => {
    const text = 'HelLo, Friend!';
    me.once('msg', (message) => {
      expect(message).toMatchObject({
        senderId: friend.id,
        body: text,
        threadId: groupId,
        isGroup: true,
      });
      done();
    });
    friend.sendMessage({
      body: text,
    }, groupId);
  });

  test('create poll', (done) => {
    friend.createPoll(groupId, 'This is poll', {
      yesss: true,
      hi: true,
      nooooo: false,
    });
    me.once('log_admin', (data) => {
      expect(data).toMatchObject({
        senderId: friend.id,
        threadId: groupId,
        type: 'group_poll',
        untypedData: {
          eventType: 'question_creation'
        },
      });
      done();
    });
  });

  test('set admin', async (done) => {
    await friend.setAdminThread(groupId, false, me.id).then(ignore, ignore);
    me.once('log_admin', (data) => {
      expect(data).toMatchObject({
        senderId: friend.id,
        threadId: groupId,
        type: 'change_thread_admins',
        untypedData: {
          aDMINEVENT: 'add_admin'
        },
      });
      done();
    });
    await friend.setAdminThread(groupId, true, me.id);
  });

  test('set approval mode', async done => {
    await friend.setApprovalMode(groupId, true);
    me.on('log_admin', (data) => {
      expect(data).toMatchObject({
        senderId: friend.id,
        threadId: groupId,
        isGroup: true,
        type: 'change_thread_approval_mode',
      });
      done();
    });
    await friend.setApprovalMode(groupId, false);
  });

  test('delete message group', async () => {
    await friend.deleteThread(groupId);
    await me.deleteThread(groupId);
  });
});
