import {
  Cookie,
} from 'request';

import Browser, { Form } from './utils/Browser';
import Api from './Api';

export interface Info {
  email: string;
  pass: string;
}
interface State {
  state: Cookie[];
}
export type UserInfo = Info | State;

const isInfo = (object: Form): boolean => ('email' in object) && ('pass' in object);
const isState = (object: Form): boolean => ('state' in object);
const isUserInfo = (object: Form): boolean => isInfo(object) || isState(object);

export default class Facebook {
  user: UserInfo;

  browser: Browser;

  constructor(user: UserInfo) {
    if (!isUserInfo(user)) {
      throw new Error('Please login with email/pass or cookie!');
    }
    this.user = user;
    this.browser = new Browser((user as State).state);
  }

  async login(): Promise<Api> {
    if (isInfo(this.user)) {
      await this.browser.init(this.user as Info);
    }
    const opt = await this.browser.createOpt();
    const api = new Api(this.browser, opt);
    // handle with api here
    return api;
  }
}
