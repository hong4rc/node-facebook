import Api, { Form } from '../Api';
import {
  fPresence, fProxy, fTyping, fNewMsg, fPayLoad, fReceipt, fLog, fMarkRead,
} from '../utils/formatter';

const getPayLoad = (payload: number[]): Form[] => {
  const obj = JSON.parse(String.fromCharCode(...payload));
  if (!Array.isArray(obj.deltas)) {
    return [];
  }
  return obj.deltas.map((delta: Form): Form => delta.deltaMessageReaction).filter(Boolean);
};

export default function (this: Api): boolean {
  if (this.isRunning) {
    return false;
  }
  this.isRunning = true;
  this.shouldRunning = true;
  const handleDelta = (delta: Form): void => {
    switch (delta.class) {
      case 'NewMessage':
        this.emit('msg', fNewMsg(delta));
        break;
      case 'ClientPayload':
        getPayLoad(delta.payload).forEach((data: Form) => {
          this.emit('reaction', fPayLoad(data));
        });
        break;
      case 'NoOp':
        break;
      case 'ReadReceipt':
        this.emit('read_receipt', fReceipt(delta));
        break;
      case 'DeliveryReceipt':
        this.emit('delivery_receipt', fReceipt(delta));
        break;
      case 'AdminTextMessage':
      case 'ParticipantLeftGroupThread':
      case 'ParticipantsAddedToGroupThread':
        this.emit('log_admin', fLog(delta));
        break;
      case 'MarkFolderSeen':
        break;
      case 'MarkRead':
        this.emit('mark_read', fMarkRead(delta));
        break;
      default:
        this.emit('other_delta', delta);
    }
  };
  const invoker = (): boolean => {
    this.mPull = this.pull();
    this.mPull.then((res: Form): void => {
      if (this.shouldRunning !== true) {
        return;
      }
      (res as Form[]).forEach((ms: Form) => {
        switch (ms.type) {
          case 'typ':
            this.emit('typ', fTyping(ms));
            break;
          case 'buddylist_overlay':
            Object.entries(ms.overlay).forEach((entries: [string, Form]) => {
              this.emit('presence', fPresence(...entries));
            });
            break;
          case 'chatproxy-presence':
            Object.entries(ms.buddyList).forEach((entries: [string, Form]) => {
              if (entries[1].p) {
                this.emit('presence', fProxy(...entries));
              }
            });
            break;
          case 'delta':
            handleDelta(ms.delta);
            break;
          case 'notification':
          case 'm_notification':
          case 'notifications_sync':
          case 'notifications_seen':
          case 'inbox':
          case 'deltaflow':
            this.emit('ignore', ms);
            break;
          default:
            this.emit('other', ms);
        }
      });
    }).finally(invoker);
    return true;
  };
  return invoker();
}
