import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Environment from '../services/environment'

// NOTE: in general, don't use this. use portals.

export default class Overlay {
  constructor () {
    this.getData = this.getData.bind(this)
    this.setData = this.setData.bind(this)
    this.get = this.get.bind(this)
    this.get$ = this.get$.bind(this)
    this.open = this.open.bind(this)
    this.closeFromBackButton = this.closeFromBackButton.bind(this)
    this.close = this.close.bind(this)
    this.overlays = new Rx.BehaviorSubject(null)
    this._data = new Rx.BehaviorSubject(null)
  }

  getData () {
    return this._data
  }

  setData (data) {
    return this._data.next(data)
  }

  get () {
    return this.overlays.getValue()
  }

  get$ () {
    return this.overlays.pipe(rx.map(overlays => _.map(overlays, '$')))
  }

  open ($, param) {
    if (param == null) { param = {} }
    const { data, onComplete, onCancel, id } = param
    if (Environment.isIos()) {
      document.activeElement.blur() // hide keyboard
    }
    // setTimeout ->
    //   document.activeElement.blur()
    // , 0

    const newOverlays = _.filter((this.overlays.getValue() || []).concat(
      { $, onComplete, onCancel, id }
    ))
    this.overlays.next(newOverlays)

    window.addEventListener('backbutton', this.closeFromBackButton)

    this.setData(data) // TODO: per-overlay data

    // prevent body scrolling while viewing menu
    document.body.style.overflow = 'hidden'
  }

  closeFromBackButton (e) {
    e.stopPropagation()
    return this.close({ isFromBackButton: true })
  }

  close (param) {
    let onCancel, onComplete
    if (param == null) { param = {} }
    const { action, response, id } = param
    let overlays = this.overlays.getValue()
    if (_.isEmpty(overlays)) {
      return
    }

    window.removeEventListener('backbutton', this.closeFromBackButton)

    if (id) {
      const index = _.findIndex(overlays, { id })
      if (index !== -1) {
        ({ onComplete, onCancel } = overlays[index])
        overlays.splice(index, 1)
      }
    } else {
      ({ onComplete, onCancel } = overlays.pop())
    }

    if (_.isEmpty(overlays)) {
      overlays = null
    }
    this.overlays.next(overlays)

    if (action === 'complete') {
      onComplete?.(response)
    } else {
      onCancel?.(response)
    }

    document.body.style.overflow = 'auto'
  }
}
