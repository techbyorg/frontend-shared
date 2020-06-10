/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import * as _ from 'lodash-es'

// FIXME: work with zorium 3

function getDraggable (el, tries) {
  if (tries == null) { tries = 0 }
  let parent = el.parentNode
  // go up until we get the draggable class
  const maxTries = 8
  if ((tries < maxTries) && (parent.className.indexOf('draggable') === -1)) {
    return parent = getDraggable(parent, tries + 1)
  } else {
    return parent
  }
}

function isBefore (el1, el2) {
  const el1Draggable = getDraggable(el1)
  const el2Draggable = getDraggable(el2)
  if (el2Draggable === el1Draggable) {
    let cur = el1.previousSibling
    while (cur) {
      if (cur === el2) {
        return true
      }
      cur = cur.previousSibling
    }
  }
  return false
}

export default class Base {
  getImageLoadHashByUrl (url) {
    if (typeof window === 'undefined' || window === null) {
      return 'is-image-loaded'
    }

    const hash = model.image.getHash(url)
    const isImageLoaded = model.image.isLoadedByHash(hash)
    if (isImageLoaded) {
      return 'is-image-loaded'
    } else {
      model.image.load(url)
        .then(function () {
        // don't want to re-render entire state every time a pic loads in
          const all = document.querySelectorAll(`.image-loading-${hash}`)
          return _.forEach(all, el => el.classList.add('is-image-loaded'))
        })
      return `image-loading-${hash}`
    }
  }

  onDragOver (e) {
    const draggable = getDraggable(e.target)
    if (isBefore($$dragEl, draggable)) {
      return draggable.parentNode.insertBefore($$dragEl, draggable)
    } else {
      return draggable.parentNode.insertBefore($$dragEl, draggable.nextSibling)
    }
  }

  onDragEnd () {
    const $$dragEl = null
    const order = _.map($$el.current.querySelectorAll('.draggable'), ({ dataset }) => dataset.id)
    return onReorder(order)
  }

  onDragStart (e) {
    let $$dragEl
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', null)
    return $$dragEl = e.target
  }

  afterMount ($$el) {
    let isImageLoaded
    return isImageLoaded = false
  }
}
