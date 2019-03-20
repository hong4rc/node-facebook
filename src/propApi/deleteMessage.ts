import Api, { Form, Id } from '../Api';

export default function (this: Api, ...msgIds: Id[]): Form {
  return this.post('https://www.facebook.com/ajax/mercury/delete_messages.php', {
    message_ids: msgIds,
  });
}
