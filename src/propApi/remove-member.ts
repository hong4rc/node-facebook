import Api, { Form, Id } from '../api';

const deletes = [
  'posts',
  'comments',
  'story_threads',
  'poll_options',
  'invites',
];

export default function (this: Api, groupId: Id, memberId: Id, delIndexs: number[] = []): Form {
  const deleteOptions: Form = {};
  delIndexs.forEach((index: number) => {
    deleteOptions[`delete_${deletes[index]}`] = 1;
  });
  return this.post('https://www.facebook.com/ajax/groups/remove_member/', {
    ...deleteOptions,
    group_id: groupId,
    member_id: memberId,
    source: 'profile_browser',
    is_undo: '0',
    confirmed: true,
  });
}
