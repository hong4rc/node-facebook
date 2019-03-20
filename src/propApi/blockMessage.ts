import Api, { Form, Id } from '../Api';

export default function (this: Api, id: Id): Form {
  return this.post('https://www.facebook.com/messaging/block_messages/', {
    fbid: id,
  });
}
