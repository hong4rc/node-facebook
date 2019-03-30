import Api, { Form, Id } from '../Api';

export default function (this: Api, threadId: Id, title: string, options: Form): Form {
  return this.post('https://www.facebook.com/messaging/group_polling/create_poll/', {
    question_text: title,
    target_id: threadId,
    option_text_array: Object.keys(options),
    option_is_selected_array: Object.values(options).map((choose: boolean) => Number(choose)),
  });
}
