import Api, { Form } from '../Api';

export default function (this: Api, userId: string): Form {
  return this.post('https://www.facebook.com/privacy/unblock_user/', {
    uid: userId,
    privacy_source: 'privacy_settings_page',
  });
}
