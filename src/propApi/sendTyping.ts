import Api, { Form, Id } from '../Api';

export default function (this: Api, userId: Id, isTyping: boolean = true): Form {
  return this.post('https://www.facebook.com/ajax/messaging/typ.php', {
    typ: Number(isTyping) || 1,
    to: userId,
    source: 'mercury-chat',
    thread: userId,
  });
}
