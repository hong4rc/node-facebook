import Api, { Form } from '../api';

export default function (this: Api, bio: string, limit = -1): Promise<Form> {
  return this.post('https://www.facebook.com/profile/intro/bio/save/', {
    bio,
    bio_expiration_time: limit,
  });
}
