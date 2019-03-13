import { load } from 'cheerio';

import { Info } from '../Facebook';
import { Form } from './Browser';
import { Cookie } from 'tough-cookie';

const QR_LOGIN = '#login_form input';

export default (body: string, user: Info) => {
  const $ = load(body);

  let form : Form = {};
  $(QR_LOGIN).map((index: number, elem: CheerioElement) => {
    const name = $(elem).attr('name');
    const val = $(elem).val();
    val && name && (form[name] = val);
  });
  const willBeCookies = body.split('"_js_');
  willBeCookies.shift();
  const cookies = willBeCookies.map((val: string) : string => {
    const cookieData = JSON.parse(`["${findForm(val, '', ']')}]`);
    return formatCookie(cookieData, '.facebook.com');
  });

  form = Object.assign(form, {
    email: user.email,
    pass: user.pass,
    timezone: new Date().getTimezoneOffset(),
    lgndim: Buffer.from('{"w":1440,"h":900,"aw":1440,"ah":834,"c":24}').toString('base64'),
    lgnjs: ~~(Date.now()/1000),
    default_persistent: '0'
  });
  return {
    form,
    cookies,
  }
};

const findForm = (body: string, head: string, tail: string) => {
  const start = body.indexOf(head) + head.length;
  if (start < head.length) {
      return '';
  }

  const lastHalf = body.substring(start);
  const end = lastHalf.indexOf(tail);
  if (end < 0) {
      throw Error(`Could not find endTime ${tail} in the given string.`);
  }
  return lastHalf.substring(0, end);
};

const formatCookie = (arr: string[], url: string) => `${arr[0]}=${arr[1]}; Path=${arr[3]}; Domain=${url}`;
