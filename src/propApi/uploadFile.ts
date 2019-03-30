import { ReadStream } from 'fs';
import Api, { Form } from '../Api';

export default function (this: Api, attachment: ReadStream): Form {
  return this.post('https://upload.facebook.com/ajax/mercury/upload.php', {
    upload_1024: attachment,
    voice_clip: 'true',
  }).then((res: Form): Form => {
    try {
      return res.payload.metadata[0];
    } catch (error) {
      return {};
    }
  });
}
