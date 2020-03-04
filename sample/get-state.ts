import { join } from 'path';
import { writeFileSync } from 'fs';
import Facebook from '../src/facebook';

const me = new Facebook({
  // email: 'qicuiji_alisonstein_1583308955@tfbnw.net',
  // pass: 'qjly3z9r5le',
  state: [{'key':'fr','value':'15rLYDJDMyxamXHzO.AWUaildob_jQvx_B5JQb2u2cS3U.BeX2DF.gF.AAA.0.0.BeX2DF.AWVPPRhg','expires':"2020-06-02T08:03:11.000Z",'maxAge':7775994,'domain':'facebook.com','path':"/",'secure':true,'httpOnly':true,'hostOnly':false,'creation':"2020-03-04T08:03:17.622Z",'lastAccessed':"2020-03-04T08:03:20.310Z"},{'key':'sb','value':'xWBfXkzepgzx5nLNXsP1JTcL','expires':"2022-03-04T08:03:17.000Z",'maxAge':63072000,'domain':'facebook.com','path':"/",'secure':true,'httpOnly':true,'hostOnly':false,'creation':"2020-03-04T08:03:17.626Z",'lastAccessed':"2020-03-04T08:03:20.310Z"},{'key':'c_user','value':'100048415830357','expires':"2021-03-04T08:03:14.000Z",'maxAge':31535997,'domain':'facebook.com','path':"/",'secure':true,'hostOnly':false,'creation':"2020-03-04T08:03:19.189Z",'lastAccessed':"2020-03-04T08:03:20.310Z"},{'key':'xs','value':"26%3A8jFA6RskxtKZKQ%3A2%3A1583308998%3A-1%3A-1",'expires':"2021-03-04T08:03:14.000Z",'maxAge':31535997,'domain':'facebook.com','path':"/",'secure':true,'httpOnly':true,'hostOnly':false,'creation':"2020-03-04T08:03:19.190Z",'lastAccessed':"2020-03-04T08:03:20.310Z"},{'key':'spin','value':'r.1001787555_b.trunk_t.1583308999_s.1_v.2_','expires':"2020-03-05T09:03:19.000Z",'maxAge':90000,'domain':'facebook.com','path':"/",'secure':true,'httpOnly':true,'hostOnly':false,'creation':"2020-03-04T08:03:19.428Z",'lastAccessed':"2020-03-04T08:03:20.310Z"}]
});

me.login().then((api) => {
  writeFileSync(join(__dirname, 'state.json'), JSON.stringify(api.getState()));
  api.listen2();
}, console.error); // eslint-disable-line no-console
