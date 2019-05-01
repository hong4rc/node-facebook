import Api, { Form } from '../api';

export default function (this: Api, form: Form): Form {
  return this.post('https://www.facebook.com/api/graphqlbatch/', {
    queries: JSON.stringify({
      o0: form,
    }),
  }).then((response: Form) => Api.camelize(response.o0.data, 'nodes'));
}
