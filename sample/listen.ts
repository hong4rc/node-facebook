import { join } from 'path';
import { writeFileSync } from 'fs';
import Facebook from '../src/facebook';

const me = new Facebook({
  "email": "htfrcva_bushakson_1619144486@tfbnw.net",
  "pass": "wl4gfkycthg",
});

me.login().then((api) => {
  api.on('msg', (data) => {
    console.log(data);
  });
  api.listen();
}, console.error); // eslint-disable-line no-console
