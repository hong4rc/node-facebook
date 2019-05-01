import Api, { Form, Id } from '../api';
import { fMessage } from '../utils/formatter';

// todo load more old thread

export default function (this: Api, threadId: Id, limit: number = 12, timestamp: number = Date.now()): Form {
  return this.graphqlBatch({
    doc_id: '2447868575246282',
    query_params: {
      before: timestamp,
      id: threadId,
      load_delivery_receipts: true,
      load_messages: true,
      load_read_receipts: true,
      message_limit: limit,
    },
  }).then((response: Form) => response.messageThread.messages.map(fMessage));
}
