import Api, { Form, Id } from '../Api';

export default function (this: Api, userId: Id): Form {
  return this.post('https://www.facebook.com/ajax/privacy/block_user.php', {
    uid: userId,
    confirmed: 1,
    nctr: {
      _mod: 'pagelet_timeline_profile_actions',
    },
  });
}
