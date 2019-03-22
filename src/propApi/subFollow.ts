import Api, { Form, Id } from '../Api';

export default function (this: Api, userId: Id, isSeeFirst: boolean = true): Form {
  const action = isSeeFirst ? 'see_first' : 'follow';
  return this.post('https://www.facebook.com/feed/profile/sub_follow/', {
    id: userId,
    action,
    location: 1,
  });
}
