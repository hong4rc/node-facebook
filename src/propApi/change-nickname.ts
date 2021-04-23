import Api, { Form, Id } from '../api';

export default function (
  this: Api, nickname: string, threadId: Id, participantId?: Id,
): Promise<Form> {
  return this.post('https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings', {
    nickname,
    thread_or_other_fbid: threadId,
    participant_id: participantId || threadId,
  });
}
