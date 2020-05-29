import * as Rx from 'rxjs'

export default class Tooltip
  constructor: ->
    @$tooltip = new Rx.BehaviorSubject null

  get$: =>
    @$tooltip

  set$: ($tooltip) =>
    @$tooltip.next $tooltip
