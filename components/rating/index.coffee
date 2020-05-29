import {z, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Icon from '../icon'
import colors from '../../colors'

if window?
  require './index.styl'

# set isInteractive to true if tapping on a star should fill up to that star
export default $rating = (props) ->
  {valueStream, valueStreams, isInteractive, onRate,
    size = '20px', color = colors.$amber500} = props

  {valueStream, ratingStream} = useMemo ->
    valueStream ?= new Rx.BehaviorSubject 0
    {
      valueStream
      ratingStream: valueStreams?.pipe(rx.switchAll()) or valueStream
    }
  , []

  {rating, starIcons} = useStream ->
    rating: ratingStream
    starIcons: ratingStream.pipe rx.map (rating) ->
      rating ?= 0
      halfStars = Math.round(rating * 2)
      fullStars = Math.floor(halfStars / 2)
      halfStars -= fullStars * 2
      emptyStars = 5 - (fullStars + halfStars)
      _.map _.range(fullStars), -> 'star'
      .concat _.map _.range(halfStars), -> 'star-half'
      .concat _.map _.range(emptyStars), -> 'star-outline'

  setRating = (value) ->
    if valueStreams
      valueStreams.next Rx.of value
    else
      valueStream.next value
    onRate? value

  z '.z-rating', {
    style:
      height: size
  },
    _.map starIcons, (icon, i) ->
      z '.star',
        z $icon,
          icon: icon
          size: size
          isTouchTarget: false
          color: color
          onclick: if isInteractive then (-> setRating i + 1) else null
