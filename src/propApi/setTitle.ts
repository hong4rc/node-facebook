import Api, { Form, Id } from '../Api';

export default function (this: Api, threadId: Id, title: string): Form {
  return this.post('https://www.facebook.com/messaging/set_thread_name/', {
    thread_name: title,
    thread_id: threadId,
  });
}
