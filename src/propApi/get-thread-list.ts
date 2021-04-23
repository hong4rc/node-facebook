import Api, { Form } from '../api';
import { fThread } from '../utils/formatter';

// todo load more old thread

export default function (this: Api, limit: number, timestamp: number, tags: string[] = ['INBOX']): Promise<Form> {
  return this.graphqlBatch({
    doc_id: '2173363586080540',
    query_params: {
      limit,
      before: timestamp,
      tags,
      isWorkUser: false,
      includeDeliveryReceipts: true,
      includeSeqID: false,
    },
  }).then((response: Form) => response.viewer.messageThreads.nodes
    .map((thread: Form) => fThread(thread)));
}
