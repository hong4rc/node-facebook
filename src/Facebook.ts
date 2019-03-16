import {
  Cookie,
  Response,
} from "request";

import Browser from './utils/Browser';
import Api from "./Api";

export interface Info {
  email: string;
  pass: string;
}
interface State {
  state: Cookie[];
}
export type UserInfo = Info | State;

const isInfo = (object: any) : boolean => ('email' in object) && ('pass' in object);
const isState = (object: any) : boolean => ('state' in object);
const isUserInfo = (object: any) : boolean => isInfo(object) || isState(object);

export default class Facebook {
  user: UserInfo;
  browser: Browser;
  constructor(user: UserInfo) {
    if (!isUserInfo(user)) {
      throw new Error('Please login with email/pass or cookie!')
    }
    this.user = user;
    this.browser = new Browser((<State>user).state);
  }
  async login(): Promise<Api> {
    if (isInfo(this.user)) {
      await this.browser.init(<Info>this.user);
    }
    const opt = await this.browser.createOpt();
    const api = new Api(this.browser, opt);
    // handle with api here
    return api;
  }
};
