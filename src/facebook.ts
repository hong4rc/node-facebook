import {
  Cookie,
} from 'request';

import Browser, { Form } from './utils/browser';
import Api from './api';

export interface Info {
  email: string;
  pass: string;
}
interface State {
  state: Form[];
}
export type UserInfo = Info | State;

const isInfo = (object: Form): boolean => {
  try {
    return (object.email.length >= 5) && (object.pass.length >= 5);
  } catch (error) {
    return false;
  }
};
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
    this.browser = new Browser((user as State).state as Cookie[]);
  }

  async login(): Promise<Api> {
    if (!isState(this.user) && isInfo(this.user)) {
      await this.browser.init(this.user as Info).catch((error) => {
        throw error;
      });
    }
    const opt = await this.browser.createOpt();
    const api = new Api(this.browser, opt);
    // handle with api here
    return api;
  }
}
