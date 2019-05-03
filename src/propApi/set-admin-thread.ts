import Api, { Form, Id } from '../api';

export default function (this: Api, thread: Id, isAdmin: boolean, ...adminIds: Id[]): Form {
  return this.post('https://www.facebook.com/messaging/save_admins/', {
    thread_fbid: thread,
    admin_ids: adminIds,
    add: isAdmin,
  });
}
