import { URL } from 'url';
import { Form, Id } from '../api';

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

export const fTyping = (message: Form): Form => ({
  isTyping: Boolean(message.st),
  fromMobile: message.fromMobile !== false,
  from: message.from,
  threadId: message.to || message.threadFbid || message.from,
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
      const object: Form = {
        description: story.description.text,
        media: story.media,
        title: story.titleWithEntities.text,
      };
      switch (story.target.typename) {
        case 'ExternalUrl':
          object.type = 'url';
          object.url = new URL(story.url).searchParams.get('u');
          break;
        case 'LightweightAction':
          object.type = 'ware';
          object.state = story.target.lwaState;
          break;
        default:
          object.type = 'unknow';
      }
      return object;
    }
    return attachment;
  });
};

export const fNewMessage = (delta: Form): Form => {
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
    type: delta.type || delta.class,
    untypedData: delta.untypedData,
    leftId: delta.leftParticipantFbId,
    addedIds: delta.addedParticipants,
  };
};

export const fMarkRead = (delta: Form): Form => ({
  threadId: getId(delta.threadKeys),
  timestamp: delta.actionTimestamp,
});

export const fDelMessage = (delta: Form): Form => ({
  threadId: getId(delta.threadKey),
  messageIds: delta.messageIds,
});

export const fThread = (thread: Form) => {
  const {
    threadKey,
    threadType,
    allParticipants,
    lastMessage,
    ...threadF
  } = thread;

  threadF.threadId = threadKey.threadFbid || threadKey.otherUserId;
  threadF.isGroup = threadType === 'GROUP';
  threadF.allParticipants = allParticipants.edges.map((edge: Form) => edge.node.messagingActor);
  [threadF.lastMessage] = lastMessage;

  return threadF;
};

// TODO format same new message
export const fMessage = (messaged: Form) => {
  const {
    message,
    ...messageF
  } = messaged;

  messageF.message = message && message.text;

  return messageF;
};
