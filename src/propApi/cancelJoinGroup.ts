import Api, { Form, Id } from '../Api';

export default function (this: Api, groupId: Id): Form {
  return this.post('https://www.facebook.com/ajax/groups/confirm_cancel_join_dialog/', {
    group_id: groupId,
  });
}
