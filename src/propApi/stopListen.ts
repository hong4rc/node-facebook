import Api from '../Api';

export default function (this: Api): Promise<boolean> {
  if (!this.isRunning) {
    return Promise.resolve(false);
  }

  this.shouldRunning = false;
  const stop = () => {
    this.isRunning = false;
    return true;
  };
  if (this.mPull) {
    return this.mPull.then(stop, stop);
  }
  return Promise.resolve(false);
}
