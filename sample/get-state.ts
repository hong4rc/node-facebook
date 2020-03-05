import { join } from 'path';
import { writeFileSync } from 'fs';
import Facebook from '../src/facebook';

const me = new Facebook({
  "email": "wrqliba_qinson_1571535441@tfbnw.net",
  "pass": "72m9juuwwzp",
  // state: [{"key":"fr","value":"1aQw1bTRGiPPmxHyZ.AWVlUC5uaVxUaoglBx3xuAxHYcI.BeX8P_.gF.AAA.0.0.BeX8P_.AWXELZgt","expires":"2020-06-02T15:06:35.000Z","maxAge":7775996,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:06:40.084Z","lastAccessed":"2020-03-04T15:06:42.211Z"},{"key":"sb","value":"_8NfXpD1iXJkFbDt6h9dTJ29","expires":"2022-03-04T15:06:39.000Z","maxAge":63072000,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:06:40.093Z","lastAccessed":"2020-03-04T15:06:42.211Z"},{"key":"c_user","value":"100042337546655","expires":"2021-03-04T15:06:37.000Z","maxAge":31535998,"domain":"facebook.com","path":"/","secure":true,"hostOnly":false,"creation":"2020-03-04T15:06:41.256Z","lastAccessed":"2020-03-04T15:06:42.211Z"},{"key":"xs","value":"43%3AUozlEs4bvLRd-w%3A2%3A1583334399%3A16046%3A-1","expires":"2021-03-04T15:06:37.000Z","maxAge":31535998,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:06:41.259Z","lastAccessed":"2020-03-04T15:06:42.211Z"},{"key":"spin","value":"r.1001789255_b.trunk_t.1583334400_s.1_v.2_","expires":"2020-03-05T16:06:40.000Z","maxAge":90000,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:06:41.585Z","lastAccessed":"2020-03-04T15:06:42.211Z"}]
});
const you = new Facebook({
  // "email": "krecwjz_wisemanescu_1583333855@tfbnw.net",
  // "pass": "1w1uzka5o6c",
  state: [{"key":"fr","value":"1OVBFR5YwttkTFIKv.AWV3WkIaf4qcSYVRxBasCd7nHgg.BeX8N4.6z.AAA.0.0.BeX8N5.AWUvzoxz","expires":"2020-06-02T15:04:23.000Z","maxAge":7775998,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:04:25.252Z","lastAccessed":"2020-03-04T15:04:28.361Z"},{"key":"sb","value":"eMNfXmgU8uqqRhVMNDuZ9RFk","expires":"2022-03-04T15:04:25.000Z","maxAge":63072000,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:04:25.262Z","lastAccessed":"2020-03-04T15:04:28.361Z"},{"key":"c_user","value":"100047941434201","expires":"2021-03-04T15:04:24.000Z","maxAge":31535999,"domain":"facebook.com","path":"/","secure":true,"hostOnly":false,"creation":"2020-03-04T15:04:27.000Z","lastAccessed":"2020-03-04T15:04:28.361Z"},{"key":"xs","value":"10%3AQSg9XoNqGzKogA%3A2%3A1583334265%3A-1%3A-1","expires":"2021-03-04T15:04:24.000Z","maxAge":31535999,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:04:27.003Z","lastAccessed":"2020-03-04T15:04:28.361Z"},{"key":"spin","value":"r.1001789255_b.trunk_t.1583334266_s.1_v.2_","expires":"2020-03-05T16:04:26.000Z","maxAge":90000,"domain":"facebook.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-03-04T15:04:27.477Z","lastAccessed":"2020-03-04T15:04:28.361Z"}]
});

me.login().then((api) => {
 // writeFileSync(join(__dirname, 'state.json'), JSON.stringify(api.getState()));
 console.log('me login done')
}, console.error); // eslint-disable-line no-console

you.login().then((api) => {
  //writeFileSync(join(__dirname, 'state.json'), JSON.stringify(api.getState()));
 console.log('you login done')
}, console.error); // eslint-disable-line no-console
