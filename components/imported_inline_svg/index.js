import { z, useEffect, useMemo, useStream, useRef } from 'zorium'
import * as Rx from 'rxjs'

export default function $importedInlineSvg ({ importPromise }) {
  const importedSvgRef = useRef(null)

  const { isLoadingStream } = useMemo(() => {
    return {
      isLoadingStream: new Rx.BehaviorSubject(false)
    }
  })

  useStream(() => ({
    // re-render when we have ref
    isLoading: isLoadingStream
  }))

  useEffect(() => {
    isLoadingStream.next(true)
    const importIcon = async () => {
      try {
        importedSvgRef.current = (await importPromise).default
      } catch (err) {
        console.log('error loading imported svg')
      }
      isLoadingStream.next(false)
    }
    importIcon()
  }, [])

  if (importedSvgRef.current) {
    const { current: $importedSvg } = importedSvgRef
    return z($importedSvg)
  }

  return null
}
