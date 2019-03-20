import Api, { Form } from '../Api';

export default function (this: Api, archive: boolean, ...listId: string[]): Form {
  const ids: Form = {};
  listId.forEach((id: string) => {
    ids[id] = archive;
  });
  return this.post('https://www.facebook.com/ajax/mercury/change_archived_status.php', {
    ids,
  });
}
