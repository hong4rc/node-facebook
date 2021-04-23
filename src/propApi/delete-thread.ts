import Api, { Form, Id } from '../api';

export default function (this: Api, ...threadIds: Id[]): Promise<Form> {
  return this.post('https://www.facebook.com/ajax/mercury/delete_thread.php', {
    ids: threadIds,
  });
}
