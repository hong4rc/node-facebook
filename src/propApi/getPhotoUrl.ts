import Api, { Form, Id } from '../Api';

export default function (this: Api, photoId: Id): Form {
  return this.post('https://www.facebook.com/mercury/attachments/photo', {
    photo_id: photoId,
  }).then((res: Form) => {
    try {
      return res.jsmods.require[0][3][0]
    } catch (error) {
      return null;
    }
  });
}
