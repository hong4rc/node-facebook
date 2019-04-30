import Facebook from '../src/facebook';
import info from './info';
import friendApi from './api/friend';
import messageApi from './api/message';
import messageGroupApi from './api/message-group';
import otherApi from './api/other';

const fMe = new Facebook({ state: info.me.state });
const fFriend = new Facebook({ state: info.friend.state });

describe('Api', async () => {
  const pMe = fMe.login();
  const pFriend = fFriend.login();

  describe('Friend', friendApi(pMe, pFriend));
  describe('Message', messageApi(pMe, pFriend));
  describe('Message group', messageGroupApi(pMe, pFriend));
  describe('Others', otherApi(pMe, pFriend));
});
