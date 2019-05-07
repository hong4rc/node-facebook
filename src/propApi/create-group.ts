import Api, { Form, Id } from '../api';

export interface OptionGroup {
  name: string;
  privacy: 'close' | 'open' | 'secret';
  message?: string;
  pin?: boolean;
}
export default function (this: Api, option: OptionGroup, ...threadIds: Id[]): Form {
  return this.post('https://www.facebook.com/ajax/groups/create_post/', {
    name: option.name,
    members: threadIds,
    privacy: option.privacy || 'close',
    message: option.message,
    add_to_favorites: option.pin ? 'on' : undefined,
  }).then((response: Form) => ({
    id: response.jsmods.require[0][3][0].match(/(?:\/groups\/)(\d*)/)[1],
  }));
}
