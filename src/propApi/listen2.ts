import { Client } from 'mqtt';
import websocket from 'websocket-stream';

import Api, { Form, Id } from '../api';
import { URL_HOME } from '../utils/browser';

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
  lastSeqId = 1;
  chatOn = true;
  foreground = false;
  syncToken = '';
  mqttClient?: Client;
}


export default function (this: Api): Function {
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

  mqttClient.on('message', (topic, bMessage, packet) => {
    const oMessage = JSON.parse(bMessage.toString());
    console.log(topic);
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
        break;
      case '/thread_typing':
      case '/orca_typing_notifications': {
        const typ = {
          type: 'typ',
          isTyping: !!oMessage.state,
          from: oMessage.sender_fbid.toString(),
          threadID: utils.formatID((oMessage.thread || oMessage.sender_fbid).toString()),
        };
      }
      default:
        console.error('Not support now');
    }
  });
  return () => {};
}
