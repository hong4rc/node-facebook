import Api, { Form, Id } from '../Api';

export default function (this: Api, groupId: Id, activityId: Id): Form {
  return this.post(`https://www.facebook.com/groups/${groupId}/write_async/activity_undo/`, {
    activity_id: activityId,
  });
}
