import Api, { Form, Id } from '../api';

const reactions = new Map([
  ['love', '😍'],
  ['haha', '😆'],
  ['wow', '😮'],
  ['sad', '😢'],
  ['angry', '😠'],
  ['like', '👍'],
  ['dislike', '👎'],
]);

// TODO allow send name and icon
export default function (this: Api, messageId: Id, name: string = 'like'): Form {
  if (!reactions.has(name)) {
    return Promise.reject(new Error(`'We don't support ${name} now, create issue if Fb use this reaction`));
  }
  return this.post('https://www.facebook.com/webgraphql/mutation/', {
    doc_id: 1491398900900362,
    variables: JSON.stringify({
      data: {
        client_mutation_id: 0,
        actor_id: this.id,
        action: 'ADD_REACTION',
        message_id: messageId,
        reaction: reactions.get(name),
      },
    }),
  });
}
