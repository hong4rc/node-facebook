import Api, { Form, Id } from '../Api';

export default function (this: Api, attachmentId: Id, ...threadIds: Id[]): Form {
  const recipient: Form = {};
  threadIds.forEach((threadId: Id) => {
    recipient[Api.genOTI()] = threadId;
  });
  return this.post('https://www.messenger.com/mercury/attachments/forward/', {
    attachment_id: attachmentId,
    recipient_map: recipient,
  });
}
