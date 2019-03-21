import Api, { Form, Id } from '../Api';

export default function (this: Api, groupId: Id): Form {
  return this.post('https://www.facebook.com/ajax/groups/membership/leave/', {
    group_id: groupId,
    confirmed: 1,
  });
}
