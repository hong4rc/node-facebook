import Api, { Form, Id } from '../Api';

export default function (this: Api, groupId: Id, options?: Form): Form {
  let url = 'https://www.facebook.com/groups/membership/r2j/';
  const form: Form = {
    group_id: groupId,
  };
  if (options) {
    url = 'https://www.facebook.com/groups/membership_criteria_answer/save/';
    form.custom_questions = Object.keys(options);
    form.questionnaire_answers = Object.values(options);
  }
  return this.post(url, form);
}
