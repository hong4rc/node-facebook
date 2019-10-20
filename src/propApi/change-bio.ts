import Api, { Form } from '../api';

export default function (this: Api, bio: string, limit = -1): Form {
  return this.post('https://www.facebook.com/profile/intro/bio/save/', {
    bio,
    bio_expiration_time: limit,
  });
}
