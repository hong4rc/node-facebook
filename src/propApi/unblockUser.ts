import Api, { Form, Id } from '../Api';

export default function (this: Api, userId: Id): Form {
  return this.post('https://www.facebook.com/privacy/unblock_user/', {
    uid: userId,
    privacy_source: 'privacy_settings_page',
  });
}
