import Api, { Form } from '../api';
import { findForm } from '../utils/parse-form';

export default async function (this: Api): Promise<Form> {
  const response = await this.post('https://www.facebook.com/bluebar/modern_settings_menu/', {
    pmid: 2,
  });
  const string = response.data || JSON.stringify(response);
  const h = findForm(string, 'name=\\\\"h\\\\" value=\\\\"', '\\\\"');

  return this.post('https://www.facebook.com/logout.php', { ref: 'mb', h });
}
