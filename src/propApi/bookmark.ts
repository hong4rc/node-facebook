import Api, { Form, Id } from '../api';

const actions = ['add', 'hide', 'delete'];

export default function (this: Api, id: Id, index = 0): Promise<Form> {
  const action = actions[index] || actions[0];
  return this.post(`https://www.facebook.com/ajax/bookmark/${action}/`, {
    id: `navItem_${id}`,
  });
}
