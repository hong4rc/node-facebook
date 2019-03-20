import Api, { Form, Id } from '../Api';

export default function (this: Api, id: Id): Form {
  return this.post('https://www.facebook.com/ajax/bookmark/add/', {
    id: `navItem_${id}`,
  });
}
