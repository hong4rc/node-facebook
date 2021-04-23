import Api, { Form, Id } from '../api';

export default function (this: Api, ...userIds: Id[]): Promise<Form> {
  return this.post('https://www.facebook.com/chat/user_info/', {
    ids: userIds,
  }).then((response: Form) => response.payload && Api.camelize(response.payload.profiles));
}
