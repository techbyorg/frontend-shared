import {z, useMemo, useStream} from 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/of'
import _map from 'lodash/map'
import _range from 'lodash/range'

import Icon from '../icon'
import colors from '../../colors'

if window?
  require './index.styl'

# set isInteractive to true if tapping on a star should fill up to that star
module.exports = $rating = (props) ->
  {valueStream, valueStreams, isInteractive, onRate,
    size = '20px', color = colors.$amber500} = props

  {valueStream, ratingStream} = useMemo ->
    valueStream ?= new RxBehaviorSubject 0
    {
      valueStream
      ratingStream: valueStreams?.switch() or valueStream
    }
  , []

  {rating, starIcons} = useStream ->
    rating: ratingStream
    starIcons: ratingStream.map (rating) ->
      rating ?= 0
      halfStars = Math.round(rating * 2)
      fullStars = Math.floor(halfStars / 2)
      halfStars -= fullStars * 2
      emptyStars = 5 - (fullStars + halfStars)
      _map _range(fullStars), -> 'star'
      .concat _map _range(halfStars), -> 'star-half'
      .concat _map _range(emptyStars), -> 'star-outline'

  setRating = (value) ->
    if valueStreams
      valueStreams.next RxObservable.of value
    else
      valueStream.next value
    onRate? value

  z '.z-rating', {
    style:
      height: size
  },
    _map starIcons, (icon, i) ->
      z '.star',
        z $icon,
          icon: icon
          size: size
          isTouchTarget: false
          color: color
          onclick: if isInteractive then (-> setRating i + 1) else null
