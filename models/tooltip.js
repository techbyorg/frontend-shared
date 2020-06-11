// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import * as Rx from 'rxjs'

export default class Tooltip {
  constructor () {
    this.get$ = this.get$.bind(this)
    this.set$ = this.set$.bind(this)
    this.$tooltip = new Rx.BehaviorSubject(null)
  }

  get$ () {
    return this.$tooltip
  }

  set$ ($tooltip) {
    return this.$tooltip.next($tooltip)
  }
}