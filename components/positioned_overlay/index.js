/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, createPortal, useContext, useLayoutEffect, useMemo, useRef, useStream } from 'zorium'
import * as Rx from 'rxjs'

import useOnClickOutside from '../../services/use_on_click_outside'
import context from '../../context'
let $positionedOverlay

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $positionedOverlay = function (props) {
  let size, transform
  let {
    $$targetRef, hasBackdrop, onClose, anchor, offset, fillTargetWidth,
    zIndex, $content, $$ref, $$parentRef, repositionOnChangeStr
  } = props
  const { browser } = useContext(context)

  if ($$ref == null) { $$ref = useRef() }

  if (!hasBackdrop) {
    useOnClickOutside([$$ref, $$targetRef], onClose)
  }

  const { $$overlays, anchorStream, transformStream, sizeStream } = useMemo(() => ({
    $$overlays: $$parentRef?.current || document?.getElementById('overlays-portal'),
    anchorStream: new Rx.BehaviorSubject(anchor),
    transformStream: new Rx.BehaviorSubject(null),
    sizeStream: new Rx.BehaviorSubject(null)
  })
  , [$$parentRef])

  useLayoutEffect(function () {
    setTimeout(() => $$ref.current.classList.add('is-mounted'), 0)
    const targetBoundingRect = $$targetRef.current?.getBoundingClientRect() || {}
    const refRect = $$ref.current.getBoundingClientRect()
    const windowSize = browser.getSize().getValue()
    const position = {
      x: targetBoundingRect.left + window.pageXOffset,
      y: targetBoundingRect.top + window.pageYOffset
    }
    const size = { width: refRect.width, height: refRect.height }
    const targetSize = { width: targetBoundingRect.width, height: targetBoundingRect.height }
    anchor = anchor || getAnchor(position, windowSize, size)
    anchorStream.next(anchor)
    transformStream.next(getTransform(position, targetSize, anchor))
    if (fillTargetWidth) {
      sizeStream.next(targetSize)
    }

    return null
  }
  , [repositionOnChangeStr]);

  ({ anchor, transform, size } = useStream(() => ({
    anchor: anchorStream,
    transform: transformStream,
    size: sizeStream
  })))

  function getAnchor (position, windowSize, size) {
    const width = windowSize?.width
    const height = windowSize?.height
    const xAnchor = position?.x < (size.width / 2)
      ? 'left'
      : position?.x > (width - size.width)
        ? 'right'
        : 'center'
    const yAnchor = position?.y < size.height
      ? 'top'
      : (position?.y > height) || (xAnchor === 'center')
        ? 'bottom'
        : 'center'
    return `${yAnchor}-${xAnchor}`
  }

  function getTransform (position, targetSize, anchor) {
    const anchorParts = anchor.split('-')
    const xPercent = anchorParts[1] === 'left'
      ? 0
      : anchorParts[1] === 'center'
        ? -50
        : -100
    const yPercent = anchorParts[0] === 'top'
      ? 0
      : anchorParts[0] === 'center'
        ? -50
        : -100
    const xOffset = anchorParts[1] === 'left'
      ? 0
      : anchorParts[1] === 'center'
        ? targetSize.width / 2
        : targetSize.width
    const yOffset = anchorParts[0] === 'top'
      ? targetSize.height
      : anchorParts[1] === 'center'
        ? targetSize.height / 2
        : 0
    const xPx = (position?.x || 8) + xOffset + (offset?.x || 0)
    const yPx = position?.y + yOffset + (offset?.y || 0)
    return `translate(${xPercent}%, ${yPercent}%) translate(${xPx}px, ${yPx}px)`
  }

  const style = {
    top: 0,
    left: 0,
    transform,
    webkitTransform: transform
  }

  if (zIndex) {
    style.zIndex = zIndex
  }

  if (size?.width && fillTargetWidth) {
    style.minWidth = `${size.width}px`
  }

  return createPortal(
    z(`.z-positioned-overlay.anchor-${anchor}`, { ref: $$ref },
      hasBackdrop
        ? z('.backdrop', {
          onclick: onClose
        }) : undefined,
      z('.content', {
        style
      },
      $content)
    ),

    $$overlays
  )
}
