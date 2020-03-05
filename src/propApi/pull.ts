import Api, { Form } from '../api';

export default function (this: Api, form: Form = {}): Promise<Form> {
  return this.get(`https://${this.iServer}-edge-chat.facebook.com/pull`, {
    channel: `p_${this.id}`,
    viewer_uid: this.id,
    uid: this.id,
    partition: -2,
    seq: this.seq,
    msgs_recv: this.seq,
    state: 'active',
    idle: 0,
    cap: 8,
    clientid: this.clientId,
    sticky_token: this.sticky,
    sticky_pool: this.pool,
    ...form,
  }).then((response: Form) => {
    this.seq = response.seq || this.seq;
    switch (response.t) {
      case 'lb':
        if (response.lb_info) {
          this.pool = response.lb_info.pool;
          this.sticky = response.lb_info.sticky;
        }
        return [];
      case 'fullReload':
      // TODO handle this
        return [];
      case 'msg':
        return Api.camelize(response.ms);
      case 'heartbeat':
        return [];
      default:
        // eslint-disable-next-line no-console
        console.log(`We don't support '${response.t}' now, please create issue in https://github.com/Hongarc/node-facebook/issues`);
        return [];
    }
  }, (error: Form) => {
    if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
      this.changeServer();
      return this.pull(form);
    }
    this.emit('error', error);
    return [];
  });
}
