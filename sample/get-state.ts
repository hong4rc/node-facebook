import { join } from 'path';
import { writeFileSync } from 'fs';
import Facebook from '../src/facebook';

const me = new Facebook({
  email: 'your_email@example.com',
  pass: 'your_pass',
});

me.login().then((api) => {
  writeFileSync(join(__dirname, 'state.json'), JSON.stringify(api.getState()));
}, console.error); // eslint-disable-line no-console
