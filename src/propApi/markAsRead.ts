import Api, { Form } from '../Api';

export default function (this: Api, ...listId: string[]): Form {
  const ids: Form = {};
  listId.forEach((id: string): void => {
    ids[id] = true;
  });

  return this.post('https://www.facebook.com/ajax/mercury/change_read_status.php', {
    shouldSendReadReceipt: true,
    ids,
  });
}
