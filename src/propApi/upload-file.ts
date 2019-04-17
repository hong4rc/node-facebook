import { ReadStream } from 'fs';
import Api, { Form } from '../api';

export default function (this: Api, attachment: ReadStream): Form {
  return this.formData('https://upload.facebook.com/ajax/mercury/upload.php', {
    upload_1024: attachment,
    voice_clip: 'true',
  }).then((response: Form): Form => response.payload.metadata[0])
    .catch(() => ({}));
}
