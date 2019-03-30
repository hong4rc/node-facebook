import Api, { Form, Id } from '../Api';

export default function (this: Api, isAccept: boolean, ...threadIds: Id[]): Form {
  const form: Form = {};
  const key = isAccept ? 'inbox' : 'other';
  form[key] = threadIds;
  return this.post('https://www.facebook.com/ajax/mercury/move_thread.php', form);
}
