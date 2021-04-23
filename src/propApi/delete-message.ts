import Api, { Form, Id } from '../api';

export default function (this: Api, ...messageIds: Id[]): Promise<Form> {
  return this.post('https://www.facebook.com/ajax/mercury/delete_messages.php', {
    message_ids: messageIds,
  });
}
