import Api, { Form, Id } from '../api';

export default function (this: Api, userId: Id, isSeeFirst = true): Promise<Form> {
  const action = isSeeFirst ? 'see_first' : 'follow';
  return this.post('https://www.facebook.com/feed/profile/sub_follow/', {
    id: userId,
    action,
    location: 1,
  });
}
