import { Cookie } from 'request';
import Api from '../Api';

export default function (this: Api): Cookie[] {
  return this.browser.getState();
}
