import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

export function streamsOrStream (streams, stream) {
  return streams?.pipe(rx.switchAll()) || stream
}

export function setStreamsOrStream (streams, stream, value) {
  if (streams) {
    return streams.next(Rx.of(value))
  } else {
    return stream.next(value)
  }
}
