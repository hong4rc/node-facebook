import Api, { Form, Id } from '../api';

export default function (this: Api, pageId: Id, isBlock = true): Form {
  return this.post('https://www.facebook.com/privacy/block/page/', {
    objectID: pageId,
    remove: !isBlock,
  });
}
