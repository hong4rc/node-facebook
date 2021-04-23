import Api, { Form, Id } from '../api';

export default function (this: Api, userId: Id): Promise<Form> {
  return this.post('https://www.facebook.com/ajax/privacy/block_user.php', {
    uid: userId,
    confirmed: 1,
    nctr: {
      _mod: 'pagelet_timeline_profile_actions',
    },
  });
}
