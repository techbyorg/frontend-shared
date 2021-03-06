import { useMemo, useCallback, useLayoutEffect, useStream } from 'zorium'
import * as Rx from 'rxjs'

function getSize ($$el) {
  return {
    width: $$el?.clientWidth || 0,
    height: $$el?.clientHeight || 0
  }
}

export default function useRefSize ($$ref) {
  const { sizeStream } = useMemo(() => ({
    sizeStream: new Rx.BehaviorSubject(null)
  }), [])

  const onResize = useCallback(() => {
    if ($$ref?.current) {
      return sizeStream.next(getSize($$ref.current))
    }
  }, [$$ref])

  useLayoutEffect(function () {
    onResize()

    if ((typeof ResizeObserver === 'function') && $$ref.current) {
      const resizeObserver = new ResizeObserver(onResize)
      resizeObserver.observe($$ref.current)

      return () => resizeObserver.disconnect($$ref.current)
    } else if ($$ref.current) {
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }
  , [$$ref])

  const { size } = useStream(() => ({
    size: sizeStream
  }))

  return size
}
