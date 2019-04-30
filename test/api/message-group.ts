import { expect } from 'chai';
import Api, { Id, Form } from '../../src/api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;
  let messageIdHook: Id;
  let groupId: Id;
  const hookMessageId = (message: Form) => {
    messageIdHook = message.messageId || '';
  };
  before('Become friend', async () => {
    me = await pMe;
    friend = await pFriend;
    const ignore = () => {};
    await friend.addFriend(me.id).then(ignore, ignore);
    await me.acceptFriend(friend.id).then(ignore, ignore);
    await friend.changeEmoji(me.id, '💖').then(ignore, ignore);

    me.listen();
    me.on('msg', hookMessageId);
  });

  after(() => {
    me.once('off', hookMessageId);
    me.stopListen();
  });

  afterEach(() => {
    if (messageIdHook) {
      me.deleteMessage(messageIdHook);
      friend.deleteMessage(messageIdHook);
      messageIdHook = '';
    }
  });

  it('create message group', async () => {
    const name = 'My group';
    const response = await friend.createMsgGroup({
      name,
    }, me.id);
    groupId = response.threadId;
    expect(response).have.property('name', name);
  });

  it('delete user in message group', (done) => {
    friend.removeParticipant(groupId, me.id);
    me.once('log_admin', (message) => {
      expect(message).have.property('type', 'ParticipantLeftGroupThread');
      expect(message).have.property('leftId', me.id);
      expect(message).have.property('threadId', groupId);
      done();
    });
  });

  it('add user in message group', (done) => {
    friend.addUserToThread(groupId, me.id);
    me.once('log_admin', (message) => {
      expect(message).have.property('type', 'ParticipantsAddedToGroupThread');
      expect(message).have.nested.property('addedIds[0].userFbId', me.id);
      expect(message).have.property('threadId', groupId);
      done();
    });
  });

  it('delete message group', async () => {
    try {
      await friend.deleteThread(groupId);
      await me.deleteThread(groupId);
    } catch (error) {
      expect.fail();
    }
  });
};
