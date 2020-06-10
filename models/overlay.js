import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Environment from '../services/environment'

# NOTE: in general, don't use this. use portals.

export default class Overlay
  constructor: ->
    @overlays = new Rx.BehaviorSubject null
    @_data = new Rx.BehaviorSubject null

  getData: =>
    @_data

  setData: (data) =>
    @_data.next data

  get: =>
    @overlays.getValue()

  get$: =>
    @overlays.pipe rx.map (overlays) -> _.map overlays, '$'

  open: ($, {data, onComplete, onCancel, id} = {}) =>
    if Environment.isIos()
      document.activeElement.blur() # hide keyboard
      # setTimeout ->
      #   document.activeElement.blur()
      # , 0

    newOverlays = _.filter (@overlays.getValue() or []).concat(
      {$, onComplete, onCancel, id}
    )
    @overlays.next newOverlays

    window.addEventListener 'backbutton', @closeFromBackButton

    @setData data # TODO: per-overlay data

    # prevent body scrolling while viewing menu
    document.body.style.overflow = 'hidden'

  closeFromBackButton: (e) =>
    e.stopPropagation()
    @close {isFromBackButton: true}

  close: ({action, response, isFromBackButton, id} = {}) =>
    overlays = @overlays.getValue()
    if _.isEmpty overlays
      return

    window.removeEventListener 'backbutton', @closeFromBackButton

    if id
      index = _.findIndex overlays, {id}
      if index isnt -1
        {onComplete, onCancel} = overlays[index]
        overlays.splice index, 1
    else
      {onComplete, onCancel} = overlays.pop()

    if _.isEmpty overlays
      overlays = null
    @overlays.next overlays

    if action is 'complete'
      onComplete? response
    else
      onCancel? response

    document.body.style.overflow = 'auto'
