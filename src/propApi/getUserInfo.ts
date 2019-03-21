import Api, { Form, Id } from '../Api';

export default function (this: Api, ...userIds: Id[]): Form {
  return this.post('https://www.facebook.com/chat/user_info/', {
    ids: userIds,
  }).then((res: Form) => res.payload && res.payload.profiles);
}
