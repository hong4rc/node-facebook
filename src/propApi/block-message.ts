import Api, { Form, Id } from '../api';

export default function (this: Api, id: Id): Promise<Form> {
  return this.post('https://www.facebook.com/messaging/block_messages/', {
    fbid: id,
  });
}
