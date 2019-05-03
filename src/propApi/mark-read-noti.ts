import Api, { Form } from '../api';

export default function (this: Api): Form {
  return this.post('https://www.facebook.com/ajax/notifications/mark_read.php', {
    read: true,
  });
}
