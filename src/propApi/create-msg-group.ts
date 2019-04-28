import Api, { Form, Id } from '../api';

interface GroupOption {
  name: string;
  img?: Id;
}

export default function (this: Api, option: GroupOption, ...participants: Id[]): Form {
  return this.graphql({
    doc_id: 577041672419534,
    fb_api_caller_class: 'RelayModern',
    fb_api_req_friendly_name: 'MessengerGroupCreateMutation',
    variables: {
      input: {
        client_mutation_id: 1,
        actor_id: this.id,
        participants: [this.id, ...participants].map(id => ({ fbid: id })),
        thread_settings: {
          name: option.name,
          joinable_mode: 'PRIVATE', // todo: change to option
          thread_image_fbid: option.img,
        },
        entry_point: 'chat_sidebar_new_group',
      },
    },
  }).then((response: Form) => {
    const { thread } = response.messengerGroupThreadCreate;
    return {
      id: thread.id,
      name: thread.name,
      threadId: thread.threadKey.threadFbid,
      participants: thread.allParticipants.nodes,
    };
  });
}
