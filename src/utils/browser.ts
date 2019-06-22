import Url from 'url';
import request, {
  Cookie, jar, CookieJar,
  Response,
  OptionsWithUrl,
} from 'request';

import { Info } from '../facebook';
import parseForm, { findForm } from './parse-form';
import { ApiOption } from '../api';

const URL_HOME = 'https://www.facebook.com';
const URL_CP = `${URL_HOME}/checkpoint`;
const URL_LOGIN = `${URL_HOME}/login.php?login_attempt=1&lwv=111`;

export interface Form {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';

export default class Browser {
  cookieJar: CookieJar;
  userAgent: string;
  constructor(states: Cookie[] = [], userAgent: string = DEFAULT_USER_AGENT) {
    this.cookieJar = jar();
    this.userAgent = userAgent;
    states.forEach((state: Cookie) => {
      this.cookieJar.setCookie(`${state.key}=${state.value}; expires=${state.expires}; domain=${state.domain}; path=${state.path};`, URL_HOME);
    });
  }

  getOptions(url: string): OptionsWithUrl {
    return {
      headers: this.getHeaders(url),
      timeout: 60000,
      url,
      jar: this.cookieJar,
      gzip: true,
    };
  }

  getHeaders(url: string): Form {
    const { host } = Url.parse(url);
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: undefined,
      Host: host,
      Origin: undefined,
      'User-Agent': this.userAgent,
      Connection: 'keep-alive',
    };
  }

  async init(user: Info): Promise<void> {
    const response = await this.get(URL_HOME);
    const form = parseForm(response.body, user);
    const responsePost = await this.post(URL_LOGIN, form);
    const { location } = responsePost.headers;
    if (!location) {
      throw new Error('Wrong username/password.');
    }
    if (location.includes(URL_CP)) {
      throw new Error('This account is blocked by Facebook !!!');
    }
  }

  get(url: string = URL_HOME, qs?: Form): Promise<Response> {
    const options = this.getOptions(url);
    options.method = 'GET';
    options.qs = qs;
    return this.request(options);
  }

  post(url: string, form: Form): Promise<Response> {
    const options = this.getOptions(url);
    options.method = 'POST';
    options.form = form;
    return this.request(options);
  }

  formData(url: string, form: Form, qs: Form = {}): Promise<Response> {
    const options = this.getOptions(url);
    options.method = 'POST';
    options.formData = form;
    options.qs = qs;
    if (options.headers) {
      options.headers['Content-Type'] = 'multipart/form-data';
    }
    return this.request(options);
  }

  request(options: OptionsWithUrl): Promise<Response> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
    return new Promise((resolve: any, reject: any) => request(options, (error: any, response: Response): void => {
      if (error) {
        reject(error);
        return;
      }
      const cookies = response.headers['set-cookie'] || [];
      cookies.forEach((cookie: string) => {
        if (cookie.includes('facebook.com')) {
          this.cookieJar.setCookie(cookie, URL_HOME);
        }
      });
      resolve(response);
    }));
  }

  async createOpt(): Promise<ApiOption> {
    const response = await this.get();
    return {
      rev: findForm(response.body, '"client_revision":', ','),
      dtsg: findForm(response.body, '"token":"', '"'),
    };
  }

  getCookie(name: string, url: string = URL_HOME): Cookie {
    const cookie = this.cookieJar.getCookies(url).find((ck: Cookie) => ck.key === name);
    if (cookie) {
      return cookie;
    }
    throw new Error(`Not found cookie with name ${name}`);
  }

  getState(url: string = URL_HOME): Cookie[] {
    return this.cookieJar.getCookies(url);
  }
}
