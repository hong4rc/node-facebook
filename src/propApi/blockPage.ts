import Api, { Form } from '../Api';

export default function (this: Api, pageId: string, isBlock: boolean = true): Form {
  return this.post('https://www.facebook.com/privacy/block/page/', {
    objectID: pageId,
    remove: !isBlock,
  });
}
