import Api, { Form, Id } from '../api';

export default function (this: Api, threadId: Id, userId: Id): Form {
  return this.post('https://www.facebook.com/chat/remove_participants/', {
    uid: userId,
    tid: threadId,
  });
}
