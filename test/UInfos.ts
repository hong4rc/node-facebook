import { Form } from '../src/Api';

export interface UInfo {
  email: string;
  pass: string;
  state: Form[];
  tmpState: Form[];
}
export default interface UInfos {
  me: UInfo;
  friend: UInfo;
}
