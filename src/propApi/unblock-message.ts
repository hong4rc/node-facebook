import Api, { Form, Id } from '../api';

export default function (this: Api, id: Id): Promise<Form> {
  const query = JSON.stringify({
    reportable_ent_token: id,
    initial_action_name: 'BLOCK_MESSAGES',
  });
  return this.post(`https://www.facebook.com/ajax/nfx/messenger_undo_block?context=${query}`);
}
