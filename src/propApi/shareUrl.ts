import Api, { Form } from '../Api';

export default function (this: Api, uri: string): Form {
  return this.post('https://www.facebook.com/message_share_attachment/fromURI/', {
    image_height: 960,
    image_width: 960,
    uri,
  }).then((res: Form): Form => res.payload.share_data)
    .catch(() => ({}));
}
