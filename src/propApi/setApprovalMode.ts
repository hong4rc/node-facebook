import Api, { Form, Id } from '../Api';

export default function (this: Api, threadId: Id, isNeed: boolean): Form {
  return this.post('https://www.facebook.com/messaging/set_approval_mode/', {
    set_mode: Number(isNeed),
    thread_fbid: threadId,
  });
}
