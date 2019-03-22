import Api, { Form } from '../Api';

export default function (this: Api, form: Form = {}): Form {
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
  }).then((res: Form) => {
    this.seq = res.seq || this.seq;
    switch (res.t) {
      case 'lb':
        if (res.lb_info) {
          this.pool = res.lb_info.pool;
          this.sticky = res.lb_info.sticky;
        }
        return null;
      case 'fullReload':
      // TODO handle this
        return null;
      case 'msg':
        return res.ms;
      case 'heartbeat':
        return null;
      default:
        console.log(`We don't support '${res.t}' now, please create issue in https://github.com/Hongarc/node-facebook/issues`); // eslint-disable-line no-console
        return null;
    }
  }, (error: Form) => {
    if (error.code === 'EAI_AGAIN') {
      this.changeServer();
      return this.pull(form);
    }
    this.emit('error', error);
    return null;
  });
}
