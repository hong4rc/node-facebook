import Api, { Form, Id } from '../api';

export default function (this: Api, userId: Id, isTyping = true): Promise<Form> {
  return this.post('https://www.facebook.com/ajax/messaging/typ.php', {
    typ: isTyping === false ? 0 : 1,
    to: userId,
    source: 'mercury-chat',
    thread: userId,
  });
}
