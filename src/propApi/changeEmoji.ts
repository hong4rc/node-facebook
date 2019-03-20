import Api, { Form, Id } from '../Api';

export default function (this: Api, threadId: Id, emoji: string): Form {
  return this.post('https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings', {
    emoji_choice: emoji,
    thread_or_other_fbid: threadId,
  });
}
