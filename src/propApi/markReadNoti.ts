import Api, { Form, Id } from '../Api';

export default function (this: Api): Form {
  return this.post('https://www.facebook.com/ajax/notifications/mark_read.php', {
    read: true,
  });
}
