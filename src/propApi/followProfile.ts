import Api, { Form, Id } from '../Api';

export default function (this: Api, userId: Id, isFollow: boolean = true): Form {
  const action = isFollow ? 'follow' : 'unfollow';
  return this.post(`https://www.facebook.com/ajax/follow/${action}_profile.php`, {
    profile_id: userId,
    location: 1,
  });
}
