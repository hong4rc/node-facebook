import Api, { Form, Id } from '../api';

const actions = ['add', 'hide', 'delete'];

export default function (this: Api, id: Id, i = 0): Form {
  const action = actions[i] || actions[0];
  return this.post(`https://www.facebook.com/ajax/bookmark/${action}/`, {
    id: `navItem_${id}`,
  });
}
