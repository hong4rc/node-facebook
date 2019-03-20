import Api, { Form } from '../Api';

export default function (this: Api, threadId: string, userId: string): Form {
  return this.post('https://www.facebook.com/chat/remove_participants/', {
    uid: userId,
    tid: threadId,
  });
}
