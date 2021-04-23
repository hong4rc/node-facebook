import { parse, HTMLElement } from 'kiat-html-parser';
import { Info } from '../facebook';
import { Form } from './browser';

const QR_LOGIN = '#login_form input';

export const parseJson = (body: string): Form => {
  const jsonString = body.replace(/^[^{]*(?={)/, '');
  try {
    return JSON.parse(jsonString.split('\n')[0]);
  } catch {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  }
};

export const findForm = (body: string, head: string, tail: string): string => {
  const matches = new RegExp(`${head}(.*?)${tail}`).exec(body);
  if (matches) {
    return matches[1];
  }
  throw new Error(`Could not found match '${head}' -> '${tail}'`);
};

export default (body: string, user: Info) => {
  const root = parse(body) as HTMLElement;

  const form: Form = {};
  root.querySelectorAll(QR_LOGIN).forEach((element) => {
    const { name, value } = element.attributes;
    if (name && value) {
      (form[name] = value);
    }
  });

  return {
    ...form,
    email: user.email,
    pass: user.pass,
    timezone: new Date().getTimezoneOffset(),
    lgndim: Buffer.from('{"w":1440,"h":900,"aw":1440,"ah":834,"c":24}').toString('base64'),
    lgnjs: Math.floor(Date.now() / 1000),
    default_persistent: '0',
  };
};
