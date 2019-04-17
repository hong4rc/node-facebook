import Api, { Form, Id } from '../api';

export default function (this: Api, userId: Id): Form {
  return this.post('https://www.facebook.com/ajax/friends/requests/cancel.php', {
    friend: userId,
    confirmed: 1,
  });
}
