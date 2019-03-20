import Api, { Arg, Form } from '../Api';

export default function (this: Api, threadId: Arg, userId: Arg): Form {
  return this.post('https://www.facebook.com/chat/remove_participants/', {
    uid: userId,
    tid: threadId,
  });
}
