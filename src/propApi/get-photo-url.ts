import Api, { Form, Id } from '../api';

export default function (this: Api, photoId: Id): Promise<string> {
  return this.post('https://www.facebook.com/mercury/attachments/photo', {
    photo_id: photoId,
  }).then((response: Form) => response.jsmods.require[0][3][0])
    .catch(() => '');
}
