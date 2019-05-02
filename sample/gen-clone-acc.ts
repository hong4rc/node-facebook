import { join } from 'path';
import { parse, HTMLElement } from 'kiat-html-parser';
import {
  readFileSync,
  writeFileSync,
} from 'fs';
import Facebook, { Info } from '../src/facebook';

const user = new Facebook({
  state: JSON.parse(readFileSync(join(__dirname, 'state.json'), 'utf8')),
});

const parseData = (html: string): Info => {
  const root = parse(html) as HTMLElement;
  const array = root.querySelectorAll('td.data');
  return {
    email: array[2].text.replace('&#064;', '@'),
    pass: array[3].text,
  };
};

const cookie = '__cookie__';

user.login().then(async (api) => {
  const newUser = async () => {
    const response = await api.post('https://www.facebook.com/whitehat/create_test_user/');
    const html = response.jsmods.markup[0][1].__html; // eslint-disable-line no-underscore-dangle
    return parseData(html);
  };

  const infoMe = await newUser();
  const infoFriend = await newUser();

  const [me, friend] = await Promise.all([
    new Facebook(infoMe).login(),
    new Facebook(infoFriend).login(),
  ]);


  const object = {
    me: {
      ...infoMe,
      state: cookie + 0,
    },
    friend: {
      ...infoFriend,
      state: cookie + 1,
    },
  };
  const string = JSON.stringify(object, null, 2)
    .replace(`"${cookie + 0}"`, JSON.stringify(me.getState()))
    .replace(`"${cookie + 1}"`, JSON.stringify(friend.getState()));
  writeFileSync(join(__dirname, 'info.json'), string);
});

// todo add it to function of api
