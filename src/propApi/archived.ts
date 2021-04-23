import Api, { Form, Id } from '../api';

export default function (this: Api, archive: boolean, ...listId: Id[]): Promise<Form> {
  const ids: Form = {};
  listId.forEach((id: Id) => {
    ids[id] = archive;
  });
  return this.post('https://www.facebook.com/ajax/mercury/change_archived_status.php', {
    ids,
  });
}
