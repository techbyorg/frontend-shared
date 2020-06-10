/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useEffect, useRef, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $tooltip from '../tooltip'
import context from '../../context'
let $tooltipPositioner

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

// this shows the main tooltip which is rendered in app.coffee
// if we render it here, it has issues with iscroll (having a position: fixed
// inside a transform)

// FIXME: move this somewhere where it can be accessed by other ocmponents
const TOOLTIPS = {
  placeSearch: {
    prereqs: null
  },
  mapLayers: {
    prereqs: ['placeSearch']
  },
  mapTypes: {
    prereqs: ['mapLayers']
  },
  mapFilters: {
    prereqs: ['mapTypes']
  },
  placeTooltip: {
    prereqs: null
  },
  itemGuides: {
    prereqs: null
  }
}

export default $tooltipPositioner = function (props) {
  let cookie, shouldBeShownStream
  if (typeof window === 'undefined' || window === null) { // could also return right away if cookie exists for perf
    return
  }
  let {
    model, isVisibleStream, offset, key, anchor, $title, $content,
    zIndex
  } = props;
  ({ cookie, model } = useContext(context))

  const $$ref = useRef();

  ({ isVisibleStream, shouldBeShownStream } = useMemo(() => ({
    isVisibleStream: isVisibleStream || new Rx.BehaviorSubject(false),

    shouldBeShownStream: cookie.getStream().pipe(
      rx.map(function (cookies) {
        const completed = cookies.completedTooltips?.split(',') || []
        const isCompleted = completed.indexOf(key) !== -1
        const prereqs = TOOLTIPS[key]?.prereqs
        return !isCompleted && _.every(prereqs, prereq => completed.indexOf(prereq) !== -1)
      }),
      rx.publishReplay(1),
      rx.refCount()
    )
  })))

  useEffect(function () {
    let isShown = false
    var disposable = shouldBeShownStream.subscribe(function (shouldBeShown) {
      // TODO: show main page tooltips when closing overlayPage?
      // one option is to have model.tooltip store all visible tooltips
      if (shouldBeShown && !isShown) {
        isShown = true
        // despite having this, ios still calls this twice, hence the flag above
        disposable?.unsubscribe()
        return setTimeout(function () {
          function checkIsReady () {
            if ($$ref && $$ref.current.clientWidth) {
              return _.show($$ref)
            } else {
              return setTimeout(checkIsReady, 100)
            }
          }

          return checkIsReady()
        }
        , 0)
      }
    }) // give time for re-render...

    return function () {
      disposable?.unsubscribe()
      isShown = false
      return isVisible.next(false)
    }
  }
  , [])

  // FIXME: useref for parent to access? or stream/subject?
  const close = () => $tooltip?.close()

  _.show = $$ref => model.tooltip.set$($z($tooltip, {
    $$target: $$ref,
    key,
    anchor,
    offset,
    isVisible,
    zIndex,
    $title,
    $content
  }))

  return z('.z-tooltip-positioner', { ref: $$ref, key: `tooltip-${key}` })
}
