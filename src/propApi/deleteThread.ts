import Api, { Form, Id } from '../Api';

export default function (this: Api, ...threadIds: Id[]): Form {
  return this.post('https://www.facebook.com/ajax/mercury/delete_thread.php', {
    ids: threadIds,
  });
}
