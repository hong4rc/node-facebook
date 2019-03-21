import Api, { Form, Id } from '../Api';

export default function (this: Api, userId: Id): Form {
  return this.post('https://www.facebook.com/ajax/add_friend/action.php', {
    to_friend: userId,
    action: 'add_friend',
    how_found: 'profile_button', // 'hovercard'
  });
}
