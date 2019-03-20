import Api, { Arg, Form } from '../Api';

export default function (this: Api, form: Arg): Form {
  return this.post('https://www.facebook.com/messaging/send/', form as Form);
}
