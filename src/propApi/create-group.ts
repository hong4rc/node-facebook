import Api, { Form, Id } from '../api';

export interface OptionGroup {
  name: string;
  privacy?: 'close' | 'open' | 'secret';
  message?: string;
  pin?: boolean;
  onlyMem?: boolean;
}

export const validOption = (option: OptionGroup): Form => ({
  name: option.name,
  privacy: option.privacy || 'close',
  message: option.message,
  add_to_favorites: option.pin ? 'on' : undefined,
  discoverability: option.onlyMem ? 'members_only' : 'anyone',
});

export default function (this: Api, option: OptionGroup, ...threadIds: Id[]): Promise<Form> {
  return this.post('https://www.facebook.com/ajax/groups/create_post/', {
    ...validOption(option),
    members: threadIds,
  }).then((response: Form) => ({
    id: response.jsmods.require[0][3][0].match(/\/groups\/(\d*)/)[1],
  }));
}
