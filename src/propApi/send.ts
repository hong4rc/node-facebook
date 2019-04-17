import Api, { Form } from '../api';

export default function (this: Api, form: Form): Form {
  return this.post('https://www.facebook.com/messaging/send/', form)
    .then((response: Form) => Api.camelize(response.payload && response.payload.actions[0]));
}
