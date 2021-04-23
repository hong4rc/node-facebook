import Api, { Form } from '../api';

export default function (this: Api, uri: string): Promise<Form> {
  return this.post('https://www.facebook.com/message_share_attachment/fromURI/', {
    image_height: 960,
    image_width: 960,
    uri,
  }).then((response: Form): Form => response.payload && response.payload.share_data);
}
