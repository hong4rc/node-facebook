import { Cookie } from 'request';
import Api from '../api';

export default function (this: Api): Cookie[] {
  return this.browser.getState();
}
