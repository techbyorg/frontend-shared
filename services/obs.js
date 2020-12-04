import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash'

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
  const combinedStream = Rx.merge(
    behaviorSubject,
    stream.pipe(rx.distinctUntilChanged(_.isEqual))
  )
  return {
    stream: combinedStream, next: behaviorSubject.next.bind(behaviorSubject)
  }
}
