import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import { starIconPath, starHalfIconPath, starOutlineIconPath } from '../icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// set isInteractive to true if tapping on a star should fill up to that star
export default function $rating (props) {
  var { colors } = useContext(context)
  const {
    valueStreams, isInteractive, onRate, size = '20px',
    color = colors.$amber500
  } = props

  const { valueStream, ratingStream } = useMemo(function () {
    let valueStream
    if (!props.valueStream) { valueStream = new Rx.BehaviorSubject(0) }
    return {
      valueStream,
      ratingStream: streamsOrStream(valueStreams, valueStream)
    }
  }, [])

  const { starIcons } = useStream(() => ({
    starIcons: ratingStream.pipe(rx.map(function (rating) {
      if (rating == null) { rating = 0 }
      let halfStars = Math.round(rating * 2)
      const fullStars = Math.floor(halfStars / 2)
      halfStars -= fullStars * 2
      const emptyStars = 5 - (fullStars + halfStars)
      return _.map(_.range(fullStars), () => starIconPath)
        .concat(_.map(_.range(halfStars), () => starHalfIconPath))
        .concat(_.map(_.range(emptyStars), () => starOutlineIconPath))
    })
    )
  }))

  function setRating (value) {
    setStreamsOrStream(valueStreams, valueStream, value)
    return onRate?.(value)
  }

  return z('.z-rating', {
    style: {
      height: size
    }
  }, _.map(starIcons, (icon, i) =>
    z('.star', [
      z($icon, {
        icon,
        size,
        color,
        onclick: isInteractive ? () => setRating(i + 1) : null
      })
    ])
  ))
}
