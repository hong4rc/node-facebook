import { parse, HTMLElement } from 'kiat-html-parser';
import { Info } from '../facebook';
import { Form } from './browser';

const QR_LOGIN = '#login_form input';


export const findForm = (body: string, head: string, tail: string): string => {
  const matches = new RegExp(`${head}(.*?)${tail}`).exec(body);
  if (matches) {
    return matches[1];
  }
  throw new Error(`Could not found match '${head}' -> '${tail}'`);
};

const formatCookie = (array: string[], url: string): string => `${array[0]}=${array[1]}; Path=${array[3]}; Domain=${url}`;

export default (body: string, user: Info) => {
  const root = parse(body) as HTMLElement;

  let form: Form = {};
  // TODO define @types/fast-html-parser
  root.querySelectorAll(QR_LOGIN).forEach((element) => {
    const { name, value } = element.attributes;
    if (name && value) {
      (form[name] = value);
    }
  });
  const willBeCookies = body.split('"_js_');
  willBeCookies.shift();
  const cookies = willBeCookies.map((value): string => {
    const cookieData = JSON.parse(`["${findForm(value, '', ']')}]`);
    return formatCookie(cookieData, '.facebook.com');
  });

  form = Object.assign(form, {
    email: user.email,
    pass: user.pass,
    timezone: new Date().getTimezoneOffset(),
    lgndim: Buffer.from('{"w":1440,"h":900,"aw":1440,"ah":834,"c":24}').toString('base64'),
    lgnjs: Math.floor(Date.now() / 1000),
    default_persistent: '0',
  });
  return {
    form,
    cookies,
  };
};
