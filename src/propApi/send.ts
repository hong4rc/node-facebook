import Api, { Form } from '../Api';

export default function (this: Api, form: Form): Form {
  return this.post('https://www.facebook.com/messaging/send/', form)
    .then((res: Form) => res.payload && res.payload.actions[0]);
}
