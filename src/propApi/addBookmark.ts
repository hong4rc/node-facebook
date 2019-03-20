import Api, { Arg, Form } from '../Api';

export default function (this: Api, id: Arg): Form {
  return this.post('https://www.facebook.com/ajax/bookmark/add/', {
    id: `navItem_${id as string}`,
  });
}
