import * as Rx from 'rxjs'

export default class Tooltip {
  constructor () {
    this.$tooltip = new Rx.BehaviorSubject(null)
  }

  get$ = () => {
    return this.$tooltip
  }

  set$ = ($tooltip) => {
    return this.$tooltip.next($tooltip)
  }
}
