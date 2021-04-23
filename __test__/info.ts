import path from 'path';
import { readFileSync } from 'fs';
import { Form } from '../src/api';

const infoPath = path.join(__dirname, 'info.json');

export interface UInfo {
  email: string;
  pass: string;
  state: Form[];
  tmpState: Form[];
}
export interface UInfos {
  me: UInfo;
  friend: UInfo;
  blocked: UInfo;
}

export default (JSON.parse(process.env.CI ? process.env.INFO as string : readFileSync(infoPath, 'utf8')) as UInfos);
