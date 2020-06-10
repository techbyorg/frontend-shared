import * as Rx from 'rxjs';

export default class StatusBar {
  constructor() {
    this.getData = this.getData.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this._data = new Rx.BehaviorSubject(null);
  }

  getData() {
    return this._data;
  }

  open(data) {
    this._data.next(data);
    if (data?.timeMs) {
      return setTimeout(this.close, data.timeMs);
    }
  }

  close() {
    return this._data.next(null);
  }
}
