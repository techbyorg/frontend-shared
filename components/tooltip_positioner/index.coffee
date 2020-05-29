import {z, useContext, useEffect, useRef, useMemo, useStream} from 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
import * as _ from 'lodash-es'

import $tooltip from '../tooltip'
import context from '../../context'

if window?
  require './index.styl'

# this shows the main tooltip which is rendered in app.coffee
# if we render it here, it has issues with iscroll (having a position: fixed
# inside a transform)

# FIXME: move this somewhere where it can be accessed by other ocmponents
TOOLTIPS =
  placeSearch:
    prereqs: null
  mapLayers:
    prereqs: ['placeSearch']
  mapTypes:
    prereqs: ['mapLayers']
  mapFilters:
    prereqs: ['mapTypes']
  placeTooltip:
    prereqs: null
  itemGuides:
    prereqs: null

module.exports = $tooltipPositioner = (props) ->
  unless window? # could also return right away if cookie exists for perf
    return
  {model, isVisibleStream, offset, key, anchor, $title, $content,
    zIndex} = props
  {cookie, model} = useContext context

  $$ref = useRef()

  {isVisibleStream, shouldBeShownStream} = useMemo ->
    {
      isVisibleStream: isVisibleStream or new RxBehaviorSubject false
      shouldBeShownStream: cookie.getStream().map (cookies) ->
        completed = cookies.completedTooltips?.split(',') or []
        isCompleted = completed.indexOf(key) isnt -1
        prereqs = TOOLTIPS[key]?.prereqs
        not isCompleted and _.every prereqs, (prereq) ->
          completed.indexOf(prereq) isnt -1
      .publishReplay(1).refCount()
    }

  useEffect ->
    isShown = false
    disposable = shouldBeShownStream.subscribe (shouldBeShown) ->
      # TODO: show main page tooltips when closing overlayPage?
      # one option is to have model.tooltip store all visible tooltips
      if shouldBeShown and not isShown
        isShown = true
        # despite having this, ios still calls this twice, hence the flag above
        disposable?.unsubscribe()
        setTimeout ->
          checkIsReady = ->
            if $$ref and $$ref.current.clientWidth
              _.show $$ref
            else
              setTimeout checkIsReady, 100
          checkIsReady()
        , 0 # give time for re-render...

    return ->
      disposable?.unsubscribe()
      isShown = false
      isVisible.next false
  , []

  # FIXME: useref for parent to access? or stream/subject?
  close = ->
    $tooltip?.close()

  _.show = ($$ref) ->
    model.tooltip.set$ $z $tooltip, {
      $$target: $$ref
      key
      anchor
      offset
      isVisible
      zIndex
      $title: $title
      $content: $content
    }

  z '.z-tooltip-positioner', {ref: $$ref, key: "tooltip-#{key}"}
