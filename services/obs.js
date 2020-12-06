import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

export function streamsOrStream (streams, stream) {
  return streams?.stream || stream
}

export function setStreamsOrStream (streams, stream, value) {
  if (streams) {
    return streams.next(value)
  } else {
    return stream.next(value)
  }
}

export function streams (stream) {
  const behaviorSubject = new Rx.BehaviorSubject(null)
  let cachedStreamResult, cachedBehaviorSubjectValue
  const combinedStream = Rx.merge(
    behaviorSubject.pipe(
      rx.tap((value) => { cachedBehaviorSubjectValue = value })
    ),
    stream.pipe(
      rx.distinctUntilChanged(_.isEqual),
      rx.tap((result) => {
        cachedStreamResult = result
        cachedBehaviorSubjectValue = null
      })
    )
  )
  return {
    stream: combinedStream,
    next: behaviorSubject.next.bind(behaviorSubject),
    isChanged: () => {
      return cachedBehaviorSubjectValue !== null &&
        cachedStreamResult !== cachedBehaviorSubjectValue
    },
    reset: () => behaviorSubject.next(cachedStreamResult)
  }
}
