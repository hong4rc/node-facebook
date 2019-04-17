import Api, { Form, Id } from '../api';

export default function (this: Api, userId: Id): Form {
  return this.post('https://www.facebook.com/ajax/profile/removefriendconfirm.php', {
    uid: userId,
    nctr: {
      _mod: 'pagelet_timeline_profile_actions',
    },
  });
}
