import Api, { Form } from '../Api';

export default function (this: Api, id: string): Form {
  return this.post('https://www.facebook.com/ajax/bookmark/add/', {
    id: `navItem_${id}`,
  });
}
