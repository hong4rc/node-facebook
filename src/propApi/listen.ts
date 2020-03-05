import { Client } from 'mqtt';
import websocket from 'websocket-stream';

import Api, { Form } from '../api';
import { URL_HOME } from '../utils/browser';
import {
  fPresence,
  fTyping,
  fNewMessage,
  fPayLoad,
  fReceipt,
  fLog,
  fMarkRead,
  fDelMessage,
} from '../utils/formatter';

const getPayLoad = (payload: number[]): Form[] => {
  const object = JSON.parse(String.fromCharCode(...payload));
  if (!Array.isArray(object.deltas)) {
    return [];
  }
  return object.deltas.map((delta: Form): Form => delta.deltaMessageReaction).filter(Boolean);
};

const topics = [
  '/t_ms',
  '/thread_typing',
  '/orca_typing_notifications',
  '/orca_presence',
  '/legacy_web',
  '/br_sr',
  '/sr_res',
  '/webrtc',
  '/onevc',
  '/notify_disconnect',
  '/inbox',
  '/mercury',
  '/messaging_events',
  '/orca_message_notifications',
  '/pp',
  '/webrtc_response',
];

export class ListenWapper {
  lastSeqId = 0;
  chatOn = true;
  foreground = false;
  syncToken = '';
  mqttClient?: Client;
}


export default async function (this: Api): Promise<Function> {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const handleDelta = (delta: Form): void => {
    switch (delta.class) {
      case 'NewMessage':
        this.emit('msg', fNewMessage(delta));
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
      case 'ThreadName':
      case 'AdminTextMessage':
      case 'ParticipantLeftGroupThread':
      case 'ParticipantsAddedToGroupThread': {
        const { type, ...rest } = fLog(delta);
        this.emit(type, rest);
        break;
      }
      case 'MarkFolderSeen':
        break;
      case 'MarkRead':
        this.emit('mark_read', fMarkRead(delta));
        break;
      case 'MessageDelete':
        this.emit('del_msg', fDelMessage(delta));
        break;
      default:
        this.emit('other_delta', delta);
    }
  };
  const response = await this.graphqlBatch({
    doc_id: '1349387578499440',
    query_params: {
      limit: 1,
      before: null,
      tags: ['INBOX'],
      includeDeliveryReceipts: false,
      includeSeqID: true,
    },
  });

  this.listenWapper.lastSeqId = response.viewer.messageThreads.syncSequenceId;

  const sessionID = Math.floor(Math.random() * 9007199254740991) + 1;
  const username = {
    u: this.id,
    s: sessionID,
    chat_on: this.listenWapper.chatOn,
    fg: this.listenWapper.foreground,
    d: this.clientId,
    ct: 'websocket',
    // App id from facebook
    aid: '219994525426954',
    mqtt_sid: '',
    cp: 3,
    ecp: 10,
    st: topics,
    pm: [],
    dc: '',
    no_auto_fg: true,
    gas: null,
  };

  const host = `wss://edge-chat.facebook.com/chat?sid=${sessionID}`;

  const options = {
    clientId: 'mqttwsclient',
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    username: JSON.stringify(username),
    clean: true,
    wsOptions: {
      // TODO: sync with browser
      headers: {
        Cookie: this.browser.cookieJar.getCookies(URL_HOME).join('; '),
        Origin: URL_HOME,
        'User-Agent': this.browser.userAgent,
        Referer: URL_HOME,
        Host: 'edge-chat.facebook.com',
      },
      origin: 'https://www.facebook.com',
      protocolVersion: 13,
    },
  };
  const mqttClient = new Client(() => websocket(host, options.wsOptions), options);

  mqttClient.on('error', (error) => {
    console.error(error);
    mqttClient.end();
  });

  mqttClient.on('connect', () => {
    let topic;
    const queue: Form = {
      sync_api_version: 10,
      max_deltas_able_to_process: 1000,
      delta_batch_size: 500,
      encoding: 'JSON',
      entity_fbid: this.id,
    };

    if (this.listenWapper.syncToken) {
      topic = '/messenger_sync_get_diffs';
      queue.last_seq_id = this.listenWapper.lastSeqId;
      queue.sync_token = this.listenWapper.syncToken;
    } else {
      topic = '/messenger_sync_create_queue';
      queue.initial_titan_sequence_id = this.listenWapper.lastSeqId;
      queue.device_params = null;
    }

    mqttClient.publish(topic, JSON.stringify(queue), { qos: 1, retain: false });
  });

  mqttClient.on('message', (topic, bMessage /* , packet */) => {
    const oMessage = Api.camelize(JSON.parse(bMessage.toString()));
    switch (topic) {
      case '/t_ms':
        if (oMessage.firstDeltaSeqId && oMessage.syncToken) {
          this.listenWapper.lastSeqId = oMessage.firstDeltaSeqId;
          this.listenWapper.syncToken = oMessage.syncToken;
          break;
        }
        if ('errorCode' in oMessage) {
          this.emit('error', oMessage);
          break;
        }
        this.listenWapper.lastSeqId = oMessage.lastIssuedSeqId;
        if (Object.prototype.hasOwnProperty.call(oMessage, 'deltas')) {
          oMessage.deltas.forEach(handleDelta);
        } else {
          console.error('Can\'t find deltas');
        }
        break;
      case '/thread_typing':
      case '/orca_typing_notifications':
        this.emit('typ', fTyping(oMessage));
        break;
      case '/orca_presence':
        oMessage.list.forEach((data: Form) => this.emit('presence', fPresence(data)));
        break;
      default:
        console.error(`Not support ${topic} now`);
    }
  });
  return () => {
    mqttClient.end();
  };
}
