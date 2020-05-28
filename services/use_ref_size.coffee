import {useState, useMemo, useCallback, useLayoutEffect, useStream} from 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

getSize = ($$el) ->
  {width: $$el?.clientWidth or 0, height: $$el?.clientHeight or 0}

module.exports = useRefSize = ($$ref) ->
  {sizeStream} = useMemo ->
    {
      sizeStream: new RxBehaviorSubject null
    }
  , []

  onResize = useCallback ->
    if $$ref?.current
      sizeStream.next getSize $$ref.current
  , [$$ref]

  useLayoutEffect ->
    onResize()

    if typeof ResizeObserver == 'function' and $$ref.current
      resizeObserver = new ResizeObserver onResize
      resizeObserver.observe $$ref.current

      return ->
        resizeObserver.disconnect $$ref.current
    else if $$ref.current
      window.addEventListener 'resize', onResize
      return ->
        window.removeEventListener 'resize', onResize
  , [$$ref]

  {size} = useStream ->
    size: sizeStream

  size
