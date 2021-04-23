import Api, { Form } from '../api';

export default function (this: Api, form: Form): Promise<Form> {
  const { variables, ...restForm } = form;
  return this.post('https://www.facebook.com/api/graphql/', {
    variables: JSON.stringify(variables),
    ...restForm,
  }).then((response: Form) => Api.camelize(response.data));
}
