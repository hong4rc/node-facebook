import Api, { Form, Id } from '../api';

export default function (this: Api, groupId: Id): Promise<Form> {
  return this.post('https://www.facebook.com/ajax/groups/membership/leave/', {
    group_id: groupId,
    confirmed: 1,
  });
}
