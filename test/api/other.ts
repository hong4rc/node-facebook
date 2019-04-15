import { expect } from 'chai';
import Api from '../../src/Api';

export default (pMe: Promise<Api>, pFriend: Promise<Api>) => async () => {
  let me: Api;
  let friend: Api;

  before('Become friend', async () => {
    me = await pMe;
    friend = await pFriend;
  });

  it('Wrong server', async () => {
    try {
      me.iServer = Api.LEN_SV;
      await me.pull();
      expect(me.iServer).at.least(0);
      expect(me.iServer).at.most(Api.LEN_SV - 1);
    } catch (error) {
      expect.fail();
    }
  });

  it('Block user', async () => {
    await me.unblockUser(friend.id);
    try {
      await me.blockUser(friend.id);
    } catch (error) {
      expect(error.error).to.equal(1409006);
    }
    await me.unblockUser(friend.id);
  });
};
