import { URL } from 'url';
import { Form, Id } from '../Api';

interface ThreadKey {
  threadFbId?: Id;
  otherUserFbId?: Id;
}
const getId = (threadKey: ThreadKey): Id => threadKey.otherUserFbId || threadKey.threadFbId || '';
export const fPresence = (userId: string, presence: Form): Form => ({
  userId,
  timestamp: presence.la * 1000,
  statUser: presence.a,
});

export const fProxy = (userId: string, presence: Form): Form => ({
  userId,
  timestamp: presence.lat * 1000,
  statUser: presence.p,
});

export const fTyping = (msg: Form): Form => ({
  isTyping: Boolean(msg.st),
  fromMobile: msg.fromMobile !== false,
  from: msg.from,
  threadId: msg.to || msg.threadFbid || msg.from,
});

export const fAttachments = (attachments: Form[]): Form[] => {
  if (!Array.isArray(attachments)) {
    return [];
  }
  return attachments.map((attachment): Form => {
    const { mercury } = attachment;
    if (!mercury) {
      return attachment;
    }
    if (mercury.stickerAttachment) {
      mercury.stickerAttachment.type = 'sticker';
      mercury.stickerAttachment.pack = mercury.stickerAttachment.pack.id;
      return mercury.stickerAttachment;
    }
    if (mercury.blobAttachment) {
      mercury.blobAttachment.type = 'file';
      mercury.blobAttachment.mimeType = attachment.mimeType;
      return mercury.blobAttachment;
    }
    if (mercury.extensibleAttachment) {
      const story = mercury.extensibleAttachment.storyAttachment;
      const obj: Form = {
        description: story.description.text,
        media: story.media,
        title: story.titleWithEntities.text,
      };
      switch (story.target.typename) {
        case 'ExternalUrl':
          obj.type = 'url';
          obj.url = new URL(story.url).searchParams.get('u');
          break;
        case 'LightweightAction':
          obj.type = 'ware';
          obj.state = story.target.lwaState;
          break;
        default:
          obj.type = 'unknow';
      }
      return obj;
    }
    return attachment;
  });
};

export const fNewMsg = (delta: Form): Form => {
  const meta = delta.messageMetadata;
  const mentions: Form = {};
  let menDatas;
  try {
    menDatas = JSON.parse(delta.data.prng);
  } catch (error) {
    menDatas = [];
  }
  menDatas.forEach((data: Form) => {
    mentions[data.i] = {
      text: delta.body.substring(data.o, data.o + data.l),
      index: data.o,
    };
  });
  return {
    senderId: meta.actorFbId,
    body: delta.body || '',
    threadId: getId(meta.threadKey),
    messageId: meta.messageId,
    timestamp: meta.timestamp,
    isGroup: Boolean(meta.threadKey.threadFbId),
    mentions,
    attachments: fAttachments(delta.attachments), // TODO format attachment
  };
};

export const fPayLoad = (data: Form): Form => ({
  threadId: getId(data.threadKey),
  messageId: data.messageId,
  reaction: data.reaction,
  senderId: data.senderId,
  userId: data.userId,
});

export const fReceipt = (delta: Form): Form => ({
  reader: delta.actorFbId,
  timestamp: delta.actionTimestampMs || delta.deliveredWatermarkTimestampMs,
  threadId: getId(delta.threadKey),
});

export const fLog = (delta: Form): Form => {
  const meta = delta.messageMetadata;
  return {
    senderId: meta.actorFbId,
    threadId: getId(meta.threadKey),
    messageId: meta.messageId,
    timestamp: meta.timestamp,
    isGroup: Boolean(meta.threadKey.threadFbId),
    adminText: meta.adminText,
    type: delta.type,
    untypedData: delta.untypedData,
    leftId: delta.leftParticipantFbId,
    addedIds: delta.addedParticipants,
  };
};

export const fMarkRead = (delta: Form): Form => ({
  threadId: getId(delta.threadKeys),
  timestamp: delta.actionTimestamp,
});
