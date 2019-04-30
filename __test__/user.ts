import Facebook from '../src/facebook';
import Api, { Id, Form } from '../src/api';
import info from './info';

export const pMe = new Facebook({ state: info.me.state }).login();
export const pFriend = new Facebook({ state: info.friend.state }).login();

let messageIdHook: Id;
const hookMessageId = (message: Form) => {
  messageIdHook = message.messageId || '';
};

export const ignore = () => {};

export const init = async (me: Api, friend: Api) => {
  await friend.addFriend(me.id).then(ignore, ignore);
  await me.acceptFriend(friend.id).then(ignore, ignore);
  await friend.changeEmoji(me.id, '💖').then(ignore, ignore);

  me.listen();
  me.on('msg', hookMessageId);
};

export const cutOff = async (me: Api, friend: Api) => {
  await me.cancelFriend(friend.id).then(ignore, ignore);
  await friend.cancelFriend(me.id).then(ignore, ignore);
  await me.removeFriend(friend.id).then(ignore, ignore);
  await me.addFriend(friend.id).then(ignore, ignore);
};

export const final = (me: Api) => {
  me.off('msg', hookMessageId);
  me.stopListen();
};

export const clear = () => {
  messageIdHook = '';
};

export const each = (me: Api, friend: Api) => {
  if (messageIdHook) {
    me.deleteMessage(messageIdHook);
    friend.deleteMessage(messageIdHook);
    clear();
  }
};
