import {z, classKebab, createPortal, useContext, useLayoutEffect, useMemo, useRef, useStream} from 'zorium'
import * as Rx from 'rxjs'

import useOnClickOutside from '../../services/use_on_click_outside'
import context from '../../context'

if window?
  require './index.styl'

export default $positionedOverlay = (props) ->
  {$$targetRef, hasBackdrop, onClose, anchor, offset, fillTargetWidth,
    zIndex, $content, $$ref, $$parentRef, repositionOnChangeStr} = props
  {browser} = useContext context

  $$ref ?= useRef()

  unless hasBackdrop
    useOnClickOutside [$$ref, $$targetRef], onClose

  {$$overlays, anchorStream, transformStream, sizeStream} = useMemo ->
    {
      $$overlays: $$parentRef?.current or document?.getElementById 'overlays-portal'
      anchorStream: new Rx.BehaviorSubject anchor
      transformStream: new Rx.BehaviorSubject null
      sizeStream: new Rx.BehaviorSubject null
    }
  , [$$parentRef]

  useLayoutEffect ->
    setTimeout (-> $$ref.current.classList.add 'is-mounted'), 0
    targetBoundingRect = $$targetRef.current?.getBoundingClientRect() or {}
    refRect = $$ref.current.getBoundingClientRect()
    windowSize = browser.getSize().getValue()
    position = {
      x: targetBoundingRect.left + window.pageXOffset
      y: targetBoundingRect.top + window.pageYOffset
    }
    size = {width: refRect.width, height: refRect.height}
    targetSize = {width: targetBoundingRect.width, height: targetBoundingRect.height}
    anchor = anchor or getAnchor position, windowSize, size
    anchorStream.next anchor
    transformStream.next getTransform position, targetSize, anchor
    if fillTargetWidth
      sizeStream.next targetSize

    return null
  , [repositionOnChangeStr]

  {anchor, transform, size} = useStream ->
    anchor: anchorStream
    transform: transformStream
    size: sizeStream


  getAnchor = (position, windowSize, size) ->
    width = windowSize?.width
    height = windowSize?.height
    xAnchor = if position?.x < size.width / 2 \
              then 'left' \
              else if position?.x > width - size.width \
              then 'right' \
              else 'center'
    yAnchor = if position?.y < size.height \
              then 'top' \
              else if position?.y > height or xAnchor is 'center' \
              then 'bottom' \
              else 'center'
    "#{yAnchor}-#{xAnchor}"

  getTransform = (position, targetSize, anchor) ->
    anchorParts = anchor.split('-')
    xPercent = if anchorParts[1] is 'left' \
               then 0 \
               else if anchorParts[1] is 'center' \
               then -50 \
               else -100
    yPercent = if anchorParts[0] is 'top' \
               then 0 \
               else if anchorParts[0] is 'center' \
               then -50 \
               else -100
    xOffset = if anchorParts[1] is 'left' \
               then 0 \
               else if anchorParts[1] is 'center' \
               then targetSize.width / 2 \
               else targetSize.width
    yOffset = if anchorParts[0] is 'top' \
               then targetSize.height \
               else if anchorParts[1] is 'center' \
               then targetSize.height / 2 \
               else 0
    xPx = (position?.x or 8) + xOffset + (offset?.x or 0)
    yPx = position?.y + yOffset + (offset?.y or 0)
    "translate(#{xPercent}%, #{yPercent}%) translate(#{xPx}px, #{yPx}px)"

  style =
    top: 0
    left: 0
    transform: transform
    webkitTransform: transform

  if zIndex
    style.zIndex = zIndex

  if size?.width && fillTargetWidth
    style.minWidth = "#{size.width}px"

  createPortal(
    z ".z-positioned-overlay.anchor-#{anchor}", {ref: $$ref},
      if hasBackdrop
        z '.backdrop', {
          onclick: onClose
        }
      z '.content', {
        style: style
      },
        $content

    $$overlays
  )
