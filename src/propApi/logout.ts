import Api, { Form } from '../Api';
import { findForm } from '../utils/parseForm';

export default async function (this: Api): Promise<Form> {
  const res = await this.post('https://www.facebook.com/bluebar/modern_settings_menu/', {
    pmid: 2,
  });
  const str = res.data || JSON.stringify(res);
  const h = findForm(str, 'name=\\\\"h\\\\" value=\\\\"', '\\\\"');

  return this.post('https://www.facebook.com/logout.php', { ref: 'mb', h });
}
