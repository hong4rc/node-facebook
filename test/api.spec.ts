import Facebook from '../src/Facebook';
import Api from '../src/Api';
import info from './info';
import friendApi from './api/friend';
import messageApi from './api/message';

const fMe = new Facebook({ state: info.me.state });
const fFriend = new Facebook({ state: info.friend.state });

describe('Api', async () => {
  let pMe: Promise<Api> = {} as Promise<Api>;
  let pFriend: Promise<Api> = {} as Promise<Api>;

  pMe = fMe.login();
  pFriend = fFriend.login();

  describe('Friend', friendApi(pMe, pFriend));
  describe('Message', messageApi(pMe, pFriend));
});
