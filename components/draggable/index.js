import * as _ from 'lodash-es'
import { z, useRef } from 'zorium'

function getDraggable (el, tries = 0) {
  const parent = el.parentNode
  // go up until we get the draggable class
  const maxTries = 8
  if ((tries < maxTries) && (parent.className.indexOf('draggable') === -1)) {
    return getDraggable(parent, tries + 1)
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

let $$dragEl

export default function $draggable (props) {
  const { onReorder, id } = props

  const $$ref = useRef()

  const onDragOver = (e) => {
    const draggable = getDraggable(e.target)
    if (!$$dragEl) return
    if (isBefore($$dragEl, draggable)) {
      return draggable.parentNode.insertBefore($$dragEl, draggable)
    } else {
      return draggable.parentNode.insertBefore($$dragEl, draggable.nextSibling)
    }
  }

  const onDragEnd = () => {
    $$dragEl = null
    const order = _.map($$ref.current.parentNode.querySelectorAll('.z-draggable'), ({ dataset }) => dataset.id)
    return onReorder(order)
  }

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', null)
    $$dragEl = e.target
  }

  return z('.z-draggable', {
    ref: $$ref,
    draggable: 'true',
    'data-id': id,
    ondragover: onDragOver,
    ondragstart: onDragStart,
    ondragend: onDragEnd
  }, props.children)
}
