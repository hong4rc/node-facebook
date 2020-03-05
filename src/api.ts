import { EventEmitter } from 'events';
import camelcaseKeys from 'camelcase-keys';

import Browser, { Form } from './utils/browser';
import acceptFriend from './propApi/accept-friend';
import addFriend from './propApi/add-friend';
import addUserToThread from './propApi/add-user-to-thread';
import archived from './propApi/archived';
import blockMessage from './propApi/block-message';
import blockPage from './propApi/block-page';
import blockUser from './propApi/block-user';
import bookmark from './propApi/bookmark';
import cancelFriend from './propApi/cancel-friend';
import cancelJoinGroup from './propApi/cancel-join-group';
import changeBio from './propApi/change-bio';
import changeEmoji from './propApi/change-emoji';
import changeNickname from './propApi/change-nickname';
import createGroup from './propApi/create-group';
import createMsgGroup from './propApi/create-msg-group';
import createPoll from './propApi/create-poll';
import deleteMessage from './propApi/delete-message';
import deleteThread from './propApi/delete-thread';
import followProfile from './propApi/follow-profile';
import forwardAttachment from './propApi/forward-attachment';
import graphql from './propApi/graphql';
import graphqlBatch from './propApi/graphql-batch';
import getMyId from './propApi/get-my-id';
import getPhotoUrl from './propApi/get-photo-url';
import getState from './propApi/get-state';
import getThreadList from './propApi/get-thread-list';
import getThreadMessages from './propApi/get-thread-messages';
import getUserInfo from './propApi/get-user-info';
import joinGroup from './propApi/join-group';
import leaveGroup from './propApi/leave-group';
import listen, { ListenWapper } from './propApi/listen';
import logout from './propApi/logout';
import markAsRead from './propApi/mark-as-read';
import markAsReadAll from './propApi/mark-as-read-all';
import markReadNoti from './propApi/mark-read-noti';
import messageRequest from './propApi/message-request';
import muteThread from './propApi/mute-thread';
import pull from './propApi/pull';
import reactMessage from './propApi/react-message';
import removeFriend from './propApi/remove-friend';
import removeMember from './propApi/remove-member';
import removeParticipant from './propApi/remove-participant';
import send from './propApi/send';
import sendMessage from './propApi/send-message';
import sendTyping from './propApi/send-typing';
import setAdminThread from './propApi/set-admin-thread';
import setApprovalMode from './propApi/set-approval-mode';
import setTitle from './propApi/set-title';
import shareUrl from './propApi/share-url';
import stopListen from './propApi/stop-listen';
import subFollow from './propApi/sub-follow';
import unblockMessage from './propApi/unblock-message';
import unblockUser from './propApi/unblock-user';
import undoActivityGroup from './propApi/undo-activity-group';
import unfollowGroup from './propApi/unfollow-group';
import unsendMessage from './propApi/unsend-message';
import uploadFile from './propApi/upload-file';

import { parseJson } from './utils/parse-form';

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
  static LEN_SV = 7;
  acceptFriend = acceptFriend;
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
  createGroup = createGroup;
  createMsgGroup = createMsgGroup;
  createPoll = createPoll;
  deleteMessage = deleteMessage;
  deleteThread = deleteThread;
  followProfile = followProfile;
  forwardAttachment = forwardAttachment;
  graphql = graphql;
  graphqlBatch = graphqlBatch;
  getMyId = getMyId;
  getPhotoUrl = getPhotoUrl;
  getState = getState;
  getThreadList = getThreadList;
  getThreadMessages = getThreadMessages;
  getUserInfo = getUserInfo;
  joinGroup = joinGroup;
  leaveGroup = leaveGroup;
  listen = listen;
  // listen2 = listen2;
  listenWapper = new ListenWapper();
  logout = logout;
  markAsRead = markAsRead;
  markAsReadAll = markAsReadAll;
  markReadNoti = markReadNoti;
  messageRequest = messageRequest;
  muteThread = muteThread;
  pull = pull;
  reactMessage = reactMessage;
  removeFriend = removeFriend;
  removeMember = removeMember;
  removeParticipant = removeParticipant;
  send = send;
  sendMessage = sendMessage;
  sendTyping = sendTyping;
  setAdminThread = setAdminThread;
  setApprovalMode = setApprovalMode;
  setTitle = setTitle;
  shareUrl = shareUrl;
  stopListen = stopListen;
  subFollow = subFollow;
  unblockMessage = unblockMessage;
  unblockUser = unblockUser;
  undoActivityGroup = undoActivityGroup;
  unfollowGroup = unfollowGroup;
  unsendMessage = unsendMessage;
  uploadFile = uploadFile;

  browser: Browser;
  requestCounter = 0;
  id: Id;
  rev: string;
  dtsg: string;
  iServer = 0;
  seq = 0;
  clientId: string = (Math.random() * 2147483648).toString(16);
  pool?: string;
  sticky?: string;
  lastSync?: number;
  idListen?: number;
  originIdListen = 0;

  constructor(browser: Browser, opt: ApiOption) {
    super();
    this.browser = browser;
    this.id = browser.getCookie('c_user').value;
    this.rev = opt.rev;
    this.dtsg = opt.dtsg;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string | symbol, ...arguments_: any[]): boolean {
    super.emit('*', event, ...arguments_);
    return super.emit(event, ...arguments_);
  }

  changeServer(): void {
    this.iServer = (this.iServer + 1 + Math.floor(Math.random() * (Api.LEN_SV - 1))) % Api.LEN_SV;
    this.pool = undefined;
    this.sticky = undefined;
  }

  static camelize(object: Form): Form {
    return camelcaseKeys(object, { deep: true });
  }

  mergeform(form: Form): Form {
    return {
      ...form,
      __user: this.id,
      __req: (++this.requestCounter).toString(36),
      __rev: this.rev,
      __a: 1,
      fb_dtsg: this.dtsg,
      jazoest: getTtstamp(this.dtsg),
    };
  }

  async get(url: string, qs: Form = {}): Promise<Form> {
    const response = await this.browser.get(url, this.mergeform(qs));
    return parseJson(response.body);
  }

  async post(url: string, form: Form = {}): Promise<Form> {
    const response = await this.browser.post(url, this.mergeform(form));
    if (response.headers.location) {
      return response.headers;
    }
    return parseJson(response.body);
  }

  async formData(url: string, form: Form = {}, qs: Form = {}): Promise<Form> {
    const response = await this.browser.formData(url, this.mergeform(form), this.mergeform(qs));
    return parseJson(response.body);
  }

  static genOTI(): number {
    return 4194304 * Date.now();
  }
}

// TODO load function of api
