// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import * as Rx from 'rxjs'

export default class Drawer {
  constructor () {
    this.isOpen = this.isOpen.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this._isOpen = new Rx.BehaviorSubject(false)
  }

  isOpen () {
    return this._isOpen
  }

  open () {
    // could use vanilla to open and close drawer for perf
    // (would need to get rid of all isOpens in state so it wouldn't re-render)
    this._isOpen.next(true)
    // prevent body scrolling while viewing menu
    return (typeof document !== 'undefined' && document !== null) && (document.body.style.overflow = 'hidden')
  }

  close () {
    this._isOpen.next(false)
    return (typeof document !== 'undefined' && document !== null) && (document.body.style.overflow = 'auto')
  }
}
