import Api, { Arg, Form } from '../Api';

export default function(this: Api, ...listId: Arg[]): Form {
  const ids: Form = {};
  listId.forEach((id: Arg): void => {
    ids[id as string] = true;
  });

  return this.post('https://www.facebook.com/ajax/mercury/change_read_status.php', {
    shouldSendReadReceipt: true,
    ids,
  });
};
