import Api, { Form } from '../api';

export default function (this: Api): Form {
  return this.post('https://www.facebook.com/ajax/mercury/mark_folder_as_read.php', {
    folder: 'inbox', // TODO 'other'
  });
}
