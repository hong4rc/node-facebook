import Api, { Form } from '../Api';

export default function (this: Api, bio: string, limit: number = -1): Form {
  return this.post('https://www.facebook.com/profile/intro/bio/save/', {
    bio,
    bio_expiration_time: limit,
  });
}
