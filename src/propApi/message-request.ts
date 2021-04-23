import Api, { Form, Id } from '../api';

export default function (this: Api, isAccept: boolean, ...threadIds: Id[]): Promise<Form> {
  const form: Form = {};
  const key = isAccept ? 'inbox' : 'other';
  form[key] = threadIds;
  return this.post('https://www.facebook.com/ajax/mercury/move_thread.php', form);
}
