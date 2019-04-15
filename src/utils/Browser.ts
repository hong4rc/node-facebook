import Url from 'url';
import request, {
  Cookie, jar, CookieJar,
  Response,
  OptionsWithUrl,
} from 'request';

import { Info } from '../Facebook';
import parseForm, { findForm } from './parseForm';
import { ApiOption } from '../Api';

const URL_HOME = 'https://www.facebook.com';
const URL_CP = `${URL_HOME}/checkpoint`;
const URL_LOGIN = `${URL_HOME}/login.php?login_attempt=1&lwv=111`;

export interface Form {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/600.3.18 (KHTML, like Gecko)'
    + ' Chrome/63.0.3239.84 Version/8.0.3 Safari/600.3.18';

const getHeaders = (url: string): Form => {
  const { host } = Url.parse(url);
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: undefined,
    Host: host,
    Origin: undefined,
    'User-Agent': DEFAULT_USER_AGENT,
    Connection: 'keep-alive',
  };
};

export default class Browser {
  cookieJar: CookieJar;
  constructor(states: Cookie[] = []) {
    this.cookieJar = jar();
    states.forEach((state: Cookie) => {
      this.cookieJar.setCookie(`${state.key}=${state.value}; expires=${state.expires}; domain=${state.domain}; path=${state.path};`, URL_HOME);
    });
  }

  getOptions(url: string): OptionsWithUrl {
    return {
      headers: getHeaders(url),
      timeout: 60000,
      url,
      jar: this.cookieJar,
      gzip: true,
    };
  }

  async init(user: Info): Promise<void> {
    const res = await this.get(URL_HOME);
    const data = parseForm(res.body, user);
    data.cookies.forEach((cookie: string) => {
      this.cookieJar.setCookie(cookie, URL_HOME);
    });
    const resPost = await this.post(URL_LOGIN, data.form);
    const { location } = resPost.headers;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Promise((resolve: any, reject: any) => request(options, (error: any, res: Response): void => {
      if (error) {
        return reject(error);
      }
      const cookies = res.headers['set-cookie'] || [];
      cookies.forEach((cookie: string) => {
        if (cookie.includes('facebook.com')) {
          this.cookieJar.setCookie(cookie, URL_HOME);
        }
      });
      resolve(res);
    }));
  }

  async createOpt(): Promise<ApiOption> {
    const res = await this.get();
    return {
      rev: findForm(res.body, '"client_revision":', ','),
      dtsg: findForm(res.body, '"token":"', '"'),
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
