let $rating;
import {z, useContext, useMemo, useStream} from 'zorium';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';
import * as rx from 'rxjs/operators';

import Icon from '../icon';
import {starIconPath, starHalfIconPath, starOutlineIconPath} from '../icon/paths';
import context from '../../context';

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl');
}

// set isInteractive to true if tapping on a star should fill up to that star
export default $rating = function(props) {
  let ratingStream;
  let {
        valueStream,
        valueStreams,
        isInteractive,
        onRate
      } = props,
      val = props.size,
      size = val != null ? val : '20px',
      val1 = props.color,
      color = val1 != null ? val1 : colors.$amber500;
  var {colors} = useContext(context);

  ({valueStream, ratingStream} = useMemo(function() {
    if (valueStream == null) { valueStream = new Rx.BehaviorSubject(0); }
    return {
      valueStream,
      ratingStream: valueStreams?.pipe(rx.switchAll()) || valueStream
    };
  }
  , []));

  const {rating, starIcons} = useStream(() => ({
    rating: ratingStream,

    starIcons: ratingStream.pipe(rx.map(function(rating) {
      if (rating == null) { rating = 0; }
      let halfStars = Math.round(rating * 2);
      const fullStars = Math.floor(halfStars / 2);
      halfStars -= fullStars * 2;
      const emptyStars = 5 - (fullStars + halfStars);
      return _.map(_.range(fullStars), () => starIconPath)
      .concat(_.map(_.range(halfStars), () => starHalfIconPath))
      .concat(_.map(_.range(emptyStars), () => starOutlineIconPath));
    })
    )
  }));

  const setRating = function(value) {
    if (valueStreams) {
      valueStreams.next(Rx.of(value));
    } else {
      valueStream.next(value);
    }
    return onRate?.(value);
  };

  return z('.z-rating', {
    style: {
      height: size
    }
  },
    _.map(starIcons, (icon, i) => z('.star',
      z($icon, {
        icon,
        size,
        color,
        onclick: isInteractive ? (() => setRating(i + 1)) : null
      }
      )
    ))
  );
};
