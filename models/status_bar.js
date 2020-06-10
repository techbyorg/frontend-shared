import * as Rx from 'rxjs'

export default class StatusBar
  constructor: ->
    @_data = new Rx.BehaviorSubject null

  getData: =>
    @_data

  open: (data) =>
    @_data.next data
    if data?.timeMs
      setTimeout @close, data.timeMs

  close: =>
    @_data.next null
