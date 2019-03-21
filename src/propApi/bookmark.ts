import Api, { Form, Id } from '../Api';

const actions = ['add', 'hide', 'delete'];

export default function (this: Api, id: Id, i: number = 0): Form {
  if (i >= actions.length) {
    i = 0;
  }
  const action = actions[i];
  return this.post(`https://www.facebook.com/ajax/bookmark/${action}/`, {
    id: `navItem_${id}`,
  });
}
