import { EventEmitter } from 'events';

import Browser, { Form } from './utils/Browser';
import addFriend from './propApi/addFriend';
import addUserToThread from './propApi/addUserToThread';
import archived from './propApi/archived';
import blockMessage from './propApi/blockMessage';
import blockPage from './propApi/blockPage';
import blockUser from './propApi/blockUser';
import bookmark from './propApi/bookmark';
import cancelFriend from './propApi/cancelFriend';
import cancelJoinGroup from './propApi/cancelJoinGroup';
import changeBio from './propApi/changeBio';
import changeEmoji from './propApi/changeEmoji';
import changeNickname from './propApi/changeNickname';
import createPoll from './propApi/createPoll';
import deleteMessage from './propApi/deleteMessage';
import deleteThread from './propApi/deleteThread';
import followProfile from './propApi/followProfile';
import forwardAttachment from './propApi/forwardAttachment';
import getMyId from './propApi/getMyId';
import getPhotoUrl from './propApi/getPhotoUrl';
import getState from './propApi/getState';
import getUserInfo from './propApi/getUserInfo';
import joinGroup from './propApi/joinGroup';
import leaveGroup from './propApi/leaveGroup';
import listen from './propApi/listen';
import markAsRead from './propApi/markAsRead';
import markAsReadAll from './propApi/markAsReadAll';
import markReadNoti from './propApi/markReadNoti';
import messageRequest from './propApi/messageRequest';
import muteThread from './propApi/muteThread';
import pull from './propApi/pull';
import removeFriend from './propApi/removeFriend';
import removeMember from './propApi/removeMember';
import removeParticipant from './propApi/removeParticipant';
import send from './propApi/send';
import sendTyping from './propApi/sendTyping';
import setAdminThread from './propApi/setAdminThread';
import setApprovalMode from './propApi/setApprovalMode';
import setTitle from './propApi/setTitle';
import shareUrl from './propApi/shareUrl';
import subFollow from './propApi/subFollow';
import unblockMessage from './propApi/unblockMessage';
import unblockUser from './propApi/unblockUser';
import undoActivityGroup from './propApi/undoActivityGroup';
import unfollowGroup from './propApi/unfollowGroup';
import uploadFile from './propApi/uploadFile';

export { Form };
export interface ApiOption {
  rev: string;
  dtsg: string;
}

export type Id = string;

const getTtstamp = (dtsg: string): string => {
  let ttstamp = '2';
  for (let i = 0; i < dtsg.length; i++) {
    ttstamp += dtsg.charCodeAt(i);
  }
  return ttstamp;
};

export default class Api extends EventEmitter {
  addFriend = addFriend;
  addUserToThread = addUserToThread;
  archived = archived;
  blockMessage = blockMessage;
  blockPage = blockPage;
  blockUser = blockUser;
  bookmark = bookmark;
  cancelFriend = cancelFriend;
  cancelJoinGroup = cancelJoinGroup;
  changeBio = changeBio;
  changeEmoji = changeEmoji;
  changeNickname = changeNickname;
  createPoll = createPoll;
  deleteMessage = deleteMessage;
  deleteThread = deleteThread;
  followProfile = followProfile;
  forwardAttachment = forwardAttachment;
  getMyId = getMyId;
  getPhotoUrl = getPhotoUrl;
  getState = getState;
  getUserInfo = getUserInfo;
  joinGroup = joinGroup;
  leaveGroup = leaveGroup;
  listen = listen;
  markAsRead = markAsRead;
  markAsReadAll = markAsReadAll;
  markReadNoti = markReadNoti;
  messageRequest = messageRequest;
  muteThread = muteThread;
  pull = pull;
  removeFriend = removeFriend;
  removeMember = removeMember;
  removeParticipant = removeParticipant;
  send = send;
  sendTyping = sendTyping;
  setAdminThread = setAdminThread;
  setApprovalMode = setApprovalMode;
  setTitle = setTitle;
  shareUrl = shareUrl;
  subFollow = subFollow;
  unblockMessage = unblockMessage;
  unblockUser = unblockUser;
  undoActivityGroup = undoActivityGroup;
  unfollowGroup = unfollowGroup;
  uploadFile = uploadFile;

  browser: Browser;
  req: number = 0;
  id: string;
  rev: string;
  dtsg: string;
  iServer: number = 0;
  seq: number = 0;
  clientId: string = (Math.random() * 2147483648).toString(16);
  pool?: string;
  sticky?: string;
  lastSync?: number;
  isRunning: boolean = false;

  constructor(browser: Browser, opt: ApiOption) {
    super();
    this.browser = browser;
    this.id = browser.getCookie('c_user').value;
    this.rev = opt.rev;
    this.dtsg = opt.dtsg;
  }

  changeServer(): void {
    this.iServer = Math.floor(Math.random() * 6);
  }

  parseJson(body: string): Form {
    try {
      const arr = body.replace('for (;;);', '').split(/}\r?\n *{/);
      if (arr.length > 1) {
        arr[0] += '}';
      }
      const obj = this.camelize(JSON.parse(arr[0]));
      // TODO update dtsg, cookie
      return obj;
    } catch (error) {
      return { data: body };
    }
  }

  camelize(obj: Form): Form {
    if (!obj || !(obj.constructor === Object || obj.constructor === Array)) {
      return obj;
    }
    const newObj: Form = {};
    Object.keys(obj).forEach((key: string) => {
      let newKey = key.replace(/[-_\s]+(.)?/g, (match, ch) => (ch ? ch.toUpperCase() : ''));
      newKey = newKey[0].toLocaleLowerCase() + newKey.substr(1);
      newObj[newKey] = this.camelize(obj[key]);
    });
    return newObj;
  }

  mergeform(form: Form): Form {
    return Object.assign(form, {
      __user: this.id,
      __req: (++this.req).toString(36),
      __rev: this.rev,
      __a: 1,
      fb_dtsg: this.dtsg, // eslint-disable-line @typescript-eslint/camelcase
      jazoest: getTtstamp(this.dtsg),
    });
  }

  async get(url: string, qs: Form = {}): Promise<Form> {
    const res = await this.browser.get(url, this.mergeform(qs));
    return this.parseJson(res.body);
  }

  async post(url: string, form: Form = {}): Promise<Form> {
    const res = await this.browser.post(url, this.mergeform(form));
    return this.parseJson(res.body);
  }

  async formData(url: string, form: Form = {}, qs: Form = {}): Promise<Form> {
    const res = await this.browser.formData(url, this.mergeform(form), this.mergeform(qs));
    return this.parseJson(res.body);
  }

  static genOTI(): number {
    return 4194304 * Date.now();
  }
}

// TODO load function of api
