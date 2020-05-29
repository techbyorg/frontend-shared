import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import Environment from '../services/environment'

# NOTE: in general, don't use this. use portals.

module.exports = class Overlay
  constructor: ->
    @overlays = new RxBehaviorSubject null
    @_.data = new RxBehaviorSubject null

  getData: =>
    @_.data

  setData: (data) =>
    @_.data.next data

  get: =>
    @overlays.getValue()

  get$: =>
    @overlays.map (overlays) -> _.map overlays, '$'

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
    document?.body.style.overflow = 'hidden'

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

    document?.body.style.overflow = 'auto'
